import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = "docs";
const tempDir = join(outputDir, ".xlsx-template-tmp");
const outputFile = join(outputDir, "on-thi-google-sheet-template.xlsx");

const headers = ["id", "question", "A", "B", "C", "D", "answer", "explanation", "level"];

const sheets = [
  {
    name: "Hàm số",
    rows: [
      [
        "ham-so-1",
        "Đạo hàm của x^2 là gì?",
        "x",
        "2x",
        "x^2",
        "2",
        "B",
        "Theo quy tắc đạo hàm lũy thừa: (x^n)' = n.x^(n-1), nên (x^2)' = 2x.",
        "Easy",
      ],
      [
        "ham-so-2",
        "Hàm số y = x^3 đồng biến trên khoảng nào?",
        "(-∞; +∞)",
        "(-∞; 0)",
        "(0; +∞)",
        "Không đồng biến",
        "A",
        "y' = 3x^2 >= 0 với mọi x và chỉ bằng 0 tại x = 0, nên hàm đồng biến trên R.",
        "Medium",
      ],
      [
        "ham-so-3",
        "Giá trị cực tiểu của y = x^2 - 4x + 5 là bao nhiêu?",
        "0",
        "1",
        "2",
        "5",
        "B",
        "y = (x - 2)^2 + 1 nên giá trị nhỏ nhất là 1 tại x = 2.",
        "Easy",
      ],
    ],
  },
  {
    name: "Tích phân",
    rows: [
      [
        "tich-phan-1",
        "Nguyên hàm của 2x là gì?",
        "x^2 + C",
        "2x^2 + C",
        "x + C",
        "2 + C",
        "A",
        "Vì (x^2)' = 2x nên nguyên hàm của 2x là x^2 + C.",
        "Easy",
      ],
      [
        "tich-phan-2",
        "Tích phân từ 0 đến 1 của x dx bằng bao nhiêu?",
        "0",
        "1/4",
        "1/2",
        "1",
        "C",
        "Tích phân của x là x^2/2. Thay cận 0 và 1 được 1/2.",
        "Easy",
      ],
      [
        "tich-phan-3",
        "Nguyên hàm của cos x là gì?",
        "sin x + C",
        "-sin x + C",
        "tan x + C",
        "-cos x + C",
        "A",
        "Đạo hàm của sin x là cos x.",
        "Easy",
      ],
    ],
  },
  {
    name: "Xác suất",
    rows: [
      [
        "xac-suat-1",
        "Gieo một con xúc xắc cân đối. Xác suất ra mặt chẵn là bao nhiêu?",
        "1/6",
        "1/3",
        "1/2",
        "2/3",
        "C",
        "Các mặt chẵn là 2, 4, 6 nên có 3 kết quả thuận lợi trên 6 kết quả.",
        "Easy",
      ],
      [
        "xac-suat-2",
        "Một hộp có 3 bi đỏ và 2 bi xanh. Lấy ngẫu nhiên 1 bi, xác suất lấy bi xanh là bao nhiêu?",
        "2/5",
        "3/5",
        "1/2",
        "1/5",
        "A",
        "Có 2 bi xanh trên tổng 5 bi, nên xác suất là 2/5.",
        "Easy",
      ],
      [
        "xac-suat-3",
        "Tung 2 đồng xu cân đối. Xác suất có đúng 1 mặt ngửa là bao nhiêu?",
        "1/4",
        "1/2",
        "3/4",
        "1",
        "B",
        "Không gian mẫu gồm NN, NS, SN, SS. Đúng 1 ngửa có 2 trường hợp trên 4.",
        "Medium",
      ],
    ],
  },
];

function xml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function columnName(index) {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function cell(value, rowIndex, columnIndex) {
  const ref = `${columnName(columnIndex)}${rowIndex}`;
  return `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
}

function worksheetXml(sheet) {
  const rows = [headers, ...sheet.rows]
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 1;
      const cells = row.map((value, columnIndex) => cell(value, excelRow, columnIndex)).join("");
      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:I${sheet.rows.length + 1}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="62" customWidth="1"/>
    <col min="3" max="6" width="22" customWidth="1"/>
    <col min="7" max="7" width="12" customWidth="1"/>
    <col min="8" max="8" width="72" customWidth="1"/>
    <col min="9" max="9" width="14" customWidth="1"/>
  </cols>
  <sheetData>${rows}</sheetData>
</worksheet>`;
}

rmSync(tempDir, { recursive: true, force: true });
rmSync(outputFile, { force: true });
mkdirSync(join(tempDir, "_rels"), { recursive: true });
mkdirSync(join(tempDir, "docProps"), { recursive: true });
mkdirSync(join(tempDir, "xl", "_rels"), { recursive: true });
mkdirSync(join(tempDir, "xl", "worksheets"), { recursive: true });

writeFileSync(
  join(tempDir, "[Content_Types].xml"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("\n  ")}
</Types>`,
);

writeFileSync(
  join(tempDir, "_rels", ".rels"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
);

writeFileSync(
  join(tempDir, "docProps", "app.xml"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Codex</Application>
</Properties>`,
);

writeFileSync(
  join(tempDir, "docProps", "core.xml"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>On Thi Google Sheet Template</dc:title>
  <dc:creator>Codex</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-05-28T00:00:00Z</dcterms:created>
</cp:coreProperties>`,
);

writeFileSync(
  join(tempDir, "xl", "workbook.xml"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheets.map((sheet, index) => `<sheet name="${xml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("\n    ")}
  </sheets>
</workbook>`,
);

writeFileSync(
  join(tempDir, "xl", "_rels", "workbook.xml.rels"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join("\n  ")}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
);

writeFileSync(
  join(tempDir, "xl", "styles.xml"),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellXfs>
</styleSheet>`,
);

sheets.forEach((sheet, index) => {
  writeFileSync(join(tempDir, "xl", "worksheets", `sheet${index + 1}.xml`), worksheetXml(sheet));
});

execFileSync("zip", ["-qr", "../on-thi-google-sheet-template.xlsx", "."], { cwd: tempDir });
rmSync(tempDir, { recursive: true, force: true });

console.log(`Created ${outputFile}`);
