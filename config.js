// ค่าตั้งหน้าเว็บ — แก้ 2 บรรทัดแรกหลัง deploy (ดู README)
// ถ้ายังไม่ใส่ หรือเปิดด้วย ?demo=1 หน้าเว็บจะใช้ข้อมูลตัวอย่าง ไม่ต่อระบบจริง
window.APP_CONFIG = {
  LIFF_ID: '2012094820-bl6O9Cgd',   // LINE Login channel "รายการรับแจ้ง มดงาน" (provider กฟส.บางปลาม้า)
  API_URL: 'https://script.google.com/macros/s/AKfycbyg6M-Pbz-D9vYsfG8xrdwuM2dVzr7cObxdPmoVEcWypyuPhpeupeDd4fPQmsYKPIM2/exec',
  GROUP_LABEL: 'กลุ่มรับแจ้ง · บางปลาม้า', // รับจาก 2 กลุ่ม (มดงาน + กลุ่มของบอท 2)
  RETENTION_DAYS: 90,
  WORKLOG: true                       // หน้าบันทึกผลการปฏิบัติงาน (ต้องเปิด scope chat_message.write ใน LIFF)
};
