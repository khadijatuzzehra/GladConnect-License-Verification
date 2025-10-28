import axios from "axios";
import * as XLSX from "xlsx";
import * as fs from "fs";

const API_URL =
  "https://verify.licence.nsw.gov.au/publicregisterapi/api/v1/licence/search/bulk";
const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
};
const BATCH_SIZE = 200;
const INPUT_FILE = "license_numbers.txt";

// --- Read license numbers from txt ---
const fileContent = fs.readFileSync(INPUT_FILE, "utf-8");
const LICENSE_NUMBERS = fileContent
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

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

async function main() {
  const results: any[] = [];
  console.log(
    `📋 Loaded ${LICENSE_NUMBERS.length} license numbers from ${INPUT_FILE}`
  );

  for (let i = 0; i < LICENSE_NUMBERS.length; i += BATCH_SIZE) {
    const batch = LICENSE_NUMBERS.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing ${i + 1}–${i + batch.length} of ${LICENSE_NUMBERS.length}`
    );

    const data = await fetchBatch(batch);
    if (data.results) results.push(...data.results);

    await new Promise((r) => setTimeout(r, 1000));
  }

  const worksheet = XLSX.utils.json_to_sheet(results);
  const outBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outBook, worksheet, "Results");
  XLSX.writeFile(outBook, "nsw_license_results.xlsx");

  console.log(
    `✅ Done! Saved ${results.length} records to nsw_license_results.xlsx`
  );
}

main().catch(console.error);
