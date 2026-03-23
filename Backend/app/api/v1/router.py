from fastapi import APIRouter
from app.api.v1.routers import auth, user, article, category, comment, search, media, stats, setting, popup

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(article.router)
api_router.include_router(category.router)
api_router.include_router(category.tag_router)
api_router.include_router(comment.router)
api_router.include_router(search.router)
api_router.include_router(media.router)
api_router.include_router(stats.router)
api_router.include_router(setting.router)
api_router.include_router(popup.router)
