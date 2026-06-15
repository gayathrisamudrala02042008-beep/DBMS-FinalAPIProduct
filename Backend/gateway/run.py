import uvicorn

if __name__ == "__main__":
    print("[SERVER] Starting ClickCart FastAPI Gateway server on http://127.0.0.1:8000")
    print("[SERVER] API Documentation is available on http://127.0.0.1:8000/docs")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
