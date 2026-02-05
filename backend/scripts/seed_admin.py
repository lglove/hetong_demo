"""创建初始超级管理员（首次部署后执行一次）。"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.services.auth import hash_password

def main():
    db = SessionLocal()
    if db.query(User).filter(User.username == "admin").first():
        print("admin 已存在，跳过")
        db.close()
        return
    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        role=UserRole.super_admin,
    )
    db.add(admin)
    db.commit()
    print("已创建超级管理员: admin / admin123")
    db.close()

if __name__ == "__main__":
    main()
