import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_media import crud_media
from app.models.media import Media, MediaType
from app.models.user import User, UserRole


ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
MAX_FILE_SIZE = 10 * 1024 * 1024


class MediaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(
        self,
        file: UploadFile,
        uploader_id: int,
        type: MediaType = MediaType.image,
    ) -> Media:
        if type == MediaType.image:
            allowed_types = ALLOWED_IMAGE_TYPES
        else:
            allowed_types = ALLOWED_IMAGE_TYPES + ALLOWED_DOCUMENT_TYPES

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型: {file.content_type}"
            )

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件大小超过限制 (最大 {MAX_FILE_SIZE // (1024 * 1024)}MB)"
            )

        original_name = file.filename or "unknown"
        file_ext = os.path.splitext(original_name)[1] or ""
        filename = f"{uuid.uuid4().hex}{file_ext}"

        date_path = datetime.utcnow().strftime("%Y/%m")
        save_dir = os.path.join(self.upload_dir, date_path)
        os.makedirs(save_dir, exist_ok=True)

        file_path = os.path.join(save_dir, filename)
        with open(file_path, "wb") as f:
            f.write(content)

        relative_path = f"/uploads/{date_path}/{filename}"
        url = relative_path

        width = None
        height = None
        if type == MediaType.image and file.content_type != "image/svg+xml":
            try:
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(content))
                width, height = img.size
            except Exception:
                pass

        media = await crud_media.create_with_uploader(
            self.db,
            filename=filename,
            original_name=original_name,
            path=relative_path,
            url=url,
            mime_type=file.content_type or "application/octet-stream",
            size=len(content),
            uploader_id=uploader_id,
            width=width,
            height=height,
            type=type,
        )
        await self.db.commit()
        await self.db.refresh(media)

        return media

    async def get_media_list(
        self,
        page: int = 1,
        page_size: int = 20,
        type: Optional[MediaType] = None,
        keyword: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        uploader_id: Optional[int] = None,
    ) -> tuple[List[Media], int]:
        return await crud_media.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            type=type,
            keyword=keyword,
            start_date=start_date,
            end_date=end_date,
            uploader_id=uploader_id,
        )

    async def get_media_by_id(self, media_id: int) -> Media:
        media = await crud_media.get_with_uploader(self.db, id=media_id)
        if not media:
            raise HTTPException(status_code=404, detail="文件不存在")
        return media

    async def delete_media(
        self,
        media_id: int,
        current_user: User,
    ) -> None:
        media = await crud_media.get_by_id(self.db, id=media_id)
        if not media:
            raise HTTPException(status_code=404, detail="文件不存在")

        if media.uploader_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权删除此文件")

        file_path = os.path.join(os.getcwd(), media.path.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)

        await crud_media.delete(self.db, id=media_id)
        await self.db.commit()

    async def batch_delete_media(
        self,
        ids: List[int],
        current_user: User,
    ) -> dict:
        success_count = 0
        failed_count = 0

        for media_id in ids:
            try:
                media = await crud_media.get_by_id(self.db, id=media_id)
                if not media:
                    failed_count += 1
                    continue

                if media.uploader_id != current_user.id and current_user.role != UserRole.admin:
                    failed_count += 1
                    continue

                file_path = os.path.join(os.getcwd(), media.path.lstrip("/"))
                if os.path.exists(file_path):
                    os.remove(file_path)

                await crud_media.delete(self.db, id=media_id)
                success_count += 1
            except Exception:
                failed_count += 1

        await self.db.commit()
        return {
            "success_count": success_count,
            "failed_count": failed_count,
        }
