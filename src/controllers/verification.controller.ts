import { Request, Response } from "express";
import axios from "axios";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

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

export const verifyLicences = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a .txt file" });
    }

    const filePath = req.file.path;
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

    console.log(`Processing ${licenseNumbers.length} license numbers...`);
    const results: any[] = [];

    for (let i = 0; i < licenseNumbers.length; i += BATCH_SIZE) {
      const batch = licenseNumbers.slice(i, i + BATCH_SIZE);
      console.log(`Fetching batch ${i + 1}–${i + batch.length}`);
      const data = await fetchBatch(batch);
      if (data.results) results.push(...data.results);
      await new Promise((r) => setTimeout(r, 1000)); // prevent rate limiting
    }

    // Convert to Excel
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const outputPath = path.join("uploads", `nsw_results_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, outputPath);

    const sanitizedResults = results.map(
      ({ headerLayoutNew, ...rest }) => rest
    );
    // Return the file
    res.status(200).send({
      message: "License Verification Completed",
      data: sanitizedResults,
    });
    // res.download(outputPath, "nsw_license_results.xlsx", (err) => {
    //   if (err) console.error("Download error:", err);
    // });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
