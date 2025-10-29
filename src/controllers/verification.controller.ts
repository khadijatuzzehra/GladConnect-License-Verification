import { Request, Response } from "express";
import axios from "axios";
import * as XLSX from "xlsx";

interface UpdatedRequest extends Request {
  file?: any;
}

const API_URL =
  "https://verify.licence.nsw.gov.au/publicregisterapi/api/v1/licence/search/bulk";
const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
};
const BATCH_SIZE = 200;

async function fetchBatch(licenses: string[]) {
  const payload = {
    licenceGroup: "Security",
    licenceNumbers: licenses,
    licenceStatuses: [],
    pageNumber: 0,
    pageSize: 10,
  };
  const res = await axios.post(API_URL, payload, { headers: HEADERS });
  return res.data;
}

export const verifyLicences = async (req: UpdatedRequest, res: Response) => {
  try {
    if (!req?.file) {
      return res.status(400).json({ error: "Please upload a .txt file" });
    }

    const filePath = req?.file.path;

    /*This chunk support TXT Files
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // clean + unique license numbers
    const licenseNumbers = Array.from(
      new Set(
        fileContent
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      )
    );
    */
    // read first sheet from XLSX
    const workbookLoad = XLSX.readFile(filePath);
    const sheetName = workbookLoad.SheetNames[0];
    if (!sheetName) {
      return res
        .status(400)
        .json({ error: "Uploaded Excel file has no sheets" });
    }
    const sheet = workbookLoad.Sheets[sheetName];

    // get rows as 2D array
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });

    // take first column only; drop an obvious header if present
    let firstCol = rows
      .map((r) => (Array.isArray(r) ? r[0] : undefined))
      .filter((v) => v !== undefined);

    if (
      firstCol.length > 0 &&
      typeof firstCol[0] === "string" &&
      /licen[cs]e/i.test(firstCol[0]) // "license"/"licence"
    ) {
      firstCol = firstCol.slice(1);
    }

    // clean + unique license numbers
    const licenseNumbers = Array.from(
      new Set(firstCol.map((v) => String(v).trim()).filter(Boolean))
    );

    console.log(`Processing ${licenseNumbers.length} license numbers...`);
    const results: any[] = [];

    for (let i = 0; i < licenseNumbers.length; i += BATCH_SIZE) {
      const batch = licenseNumbers.slice(i, i + BATCH_SIZE);
      console.log(`Fetching batch ${i + 1}–${i + batch.length}`);
      const data = await fetchBatch(batch);
      if (data.results) results.push(...data.results);
      await new Promise((r) => setTimeout(r, 1000)); // prevent rate limiting
    }

    const sanitizedResults = results.map(
      ({ headerLayoutNew, ...rest }) => rest
    );
    // Return the file
    res.status(200).send({
      message: "License Verification Completed",
      data: sanitizedResults,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
