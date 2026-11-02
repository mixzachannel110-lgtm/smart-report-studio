# IDC Smart Report Studio

ต้นแบบเว็บแอปภาษาไทยสำหรับช่างหน้างานและพนักงานสำนักงาน สร้างจากโครงสร้าง PDF Fire Pump ที่ให้มา 2 ฉบับ (56 และ 44 หน้า)

## คู่มือใช้งาน

เปิด [คู่มือภาษาไทยแบบอ่านและพิมพ์ได้](dist/user-guide.html) หรืออ่าน [ฉบับข้อความ](docs/USER-GUIDE.md) มีขั้นตอนใช้งาน15หัวข้อ แบบฝึกหนึ่งงาน และการแก้ปัญหา เข้าถึงจาก “ดูวิธีใช้งาน” ในเว็บได้เช่นกัน

หากแก้เนื้อหาใน `docs/USER-GUIDE.md` ให้รัน `python3 scripts/build-guide.py` เพื่อสร้างหน้า HTML ใหม่

## เปิดใช้งาน

เปิด `dist/index.html` ใน Chrome หรือรันจากโฟลเดอร์นี้:

```sh
npm run dev
```

แล้วเปิด http://localhost:4173

ไม่ต้องติดตั้ง npm dependencies ใช้ Python 3 สำหรับ Local Server เท่านั้น

## ทดลองได้

- 15 หน้าจอ/มุมมอง รวม Project Wizard, ข้อมูลอุปกรณ์, Field Checklist, รูปภาพ, ผลทดสอบ, เอกสาร, QA, Report Builder และ Review
- กรอกข้อมูลแล้วเห็น Letter Preview ทันที
- เพิ่มรูปหลายไฟล์ ตรวจภาพซ้ำด้วย SHA-256 จัดหมวด ใส่ Caption เลือกภาพปก
- บันทึกฟอร์มใน localStorage และรูป/ไฟล์ใน IndexedDB
- กราฟใช้ Actual Flow กับ Discharge; ไม่วาดจุดที่ไม่ได้ทดสอบ
- สร้างร่างข้อความจากกฎและข้อมูลจริง ไม่มี LLM ในต้นแบบ
- สร้างงานจากงานเดิมโดยล้างคำตอบ ผลทดสอบ รูป และ Snapshot
- ทดลองส่งตรวจ / ส่งกลับ / ล็อก Snapshot / สร้าง Revision
- ส่งออกฉบับร่างผ่าน Print → Save as PDF

ค่าตรวจเริ่มต้นเว้นว่างทั้งหมด ภาพอ้างอิงจากรายงานเดิมหน้า 10 แสดงในโครงการครัวการบินพร้อม Caption ระบุที่มา งานใหม่ไม่รับภาพนี้ไปอัตโนมัติ

## ขอบเขต

เป็น frontend prototype สำหรับตรวจ UX ไม่มี Backend, Authentication/RBAC จริง, Sync ข้ามเครื่อง, AI Vision/OCR, Digital Signature, DOCX Export หรือการรวมหน้า PDF ภาคผนวก ข้อความยาวต้องตรวจ Print Preview การล็อกและ Audit ในเครื่องใช้ทดลอง Workflow ไม่ใช่หลักฐานการรับรองที่ป้องกันการแก้ไข

JSON Backup มีข้อมูลโครงการ แต่ไม่รวม Binary รูปและเอกสาร ควรเก็บต้นฉบับไว้ การล้าง Browser Data ทำให้ข้อมูลในเครื่องหาย ฟอนต์ออนไลน์มี System Font fallback

## เอกสารสำหรับทีมพัฒนา

ดู [MVP Development Specification](docs/MVP-SPEC.md) มี UX/UI ทุกหน้าจอ ขอบเขตฟังก์ชัน Architecture ERD Data Contracts APIs AI/Rule Contracts Workflow และ UAT

## ตรวจโค้ด

```sh
npm run check
npm test
node tests/screens.test.cjs
```

ยังไม่สามารถยืนยัน Browser Rendering / PDF Pagination ในสภาพแวดล้อมที่สร้างงานได้ เพราะสิทธิ์ระบบบล็อก localhost และการเปิด Chrome ต้องตรวจบนเครื่องที่อนุญาตก่อนรับมอบ UI


## อัปเดตตาม PDF ต้นฉบับ — 29 ตุลาคม 2569

- เปลี่ยนปกเป็นกราฟิกแดง–เทาและโลโก้ Pakorn ที่สกัดจาก PDF จริง แยก Asset สองเทมเพลต ล้างชื่อลูกค้า/ชื่อรายงาน/รหัสงานเดิมออกจากภาพพื้นก่อนผูกข้อมูลใหม่
- หน้าภายในเปลี่ยนเป็นหัวกระดาษ Pakorn เส้นแดง ตารางส้ม และ Footer กลาง/ขวาตามแนวต้นฉบับ
- เพิ่มปุ่ม **เทียบ PDF ต้นฉบับ** พร้อม Page Navigation ครบ 56/44 หน้า ไฟล์อ้างอิงเหมือนต้นฉบับทุกไบต์ แต่เป็น Reference ไม่ใช่รายงานงานใหม่
- บันทึก Native Page Geometry ครบ100หน้า: PM151 55 Portrait Letter + 1 Landscape Letter (43); AGC 36 Portrait Letter + 1 Landscape Letter (25) + 7 A4 Scans (37–43)
- รูป source:true ไม่ถูกนับเป็นหลักฐานปัจจุบัน และไม่แสดงในรายงานที่สร้างใหม่
- Export จะหยุดเมื่อโหลดภาพไม่สำเร็จ แทนการพิมพ์รายงานที่ขาดหลักฐาน

**ขอบเขตความเหมือน:** ส่วนแก้ไขข้อมูลยังมี5หมวดหลัก ไม่ได้สร้างครบทุกหน้า56/44 ขาดการจับคู่คำถาม/รูป/เอกสารแต่ละหน้า การรวม Calibration และเอกสารรับรองยังต้องพัฒนา ฟอนต์ข้อความใหม่ใช้ฟอนต์ที่เครื่องมี จึงยังไม่รับรอง Pixel-level Fidelity ห้ามเข้าใจ Reference Viewer ว่าเป็นผลการ Generate ครบเล่ม

ดู [รายงานทีมตรวจและ Mapping ครบทุกหน้า](docs/TEMPLATE-AUDIT.md)
