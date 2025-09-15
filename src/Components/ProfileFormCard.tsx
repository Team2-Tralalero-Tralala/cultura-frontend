import React from 'react';
import './ProfileFormCard.css'; // สร้างไฟล์ CSS สำหรับจัด layout

const ProfileFormCard: React.FC = () => {
  return (
    <div className="profile-form-card">
      <h2>ตั้งค่าโปรไฟล์</h2>
      <form>
        <div className="profile-image-section">
          {/* วงกลมรูปโปรไฟล์และปุ่มแก้ไข */}
        </div>
        <div className="form-fields">
          <div className="row">
            <input type="text" placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)" />
            <input type="text" placeholder="นามสกุล" />
          </div>
          <div className="row">
            <input type="text" placeholder="ชื่อผู้ใช้" />
            <input type="email" placeholder="อีเมล" />
          </div>
          <div className="row">
            <input type="text" placeholder="หมายเลขโทรศัพท์" />
            <input type="number" placeholder="อายุ" />
          </div>
          <div className="row">
            <input type="text" placeholder="วัน-เดือน-ปีเกิด" />
            <div>
              <label><input type="radio" name="gender" value="male" /> ชาย</label>
              <label><input type="radio" name="gender" value="female" /> หญิง</label>
              <label><input type="radio" name="gender" value="other" /> ไม่ระบุ</label>
            </div>
          </div>
          <div className="row">
            <input type="text" placeholder="จังหวัด" />
            <input type="text" placeholder="อำเภอ/เขต" />
          </div>
          <div className="row">
            <input type="text" placeholder="ตำบล/แขวง" />
            <input type="text" placeholder="ไปรษณีย์" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button">ยกเลิก</button>
          <button type="submit">ยืนยัน</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileFormCard;