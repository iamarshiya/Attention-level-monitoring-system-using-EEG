from fastapi import APIRouter, File, UploadFile, HTTPException, Request
import pandas as pd
import io
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_eeg_file(request: Request, file: UploadFile = File(...)):
    """Accepts and validates an EEG .csv file dataset and stores it globally for the datastream."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format! Only .csv is accepted.")
    
    try:
        contents = await file.read()
        
        df = pd.read_csv(io.BytesIO(contents))
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file contains no data.")

        # Persist dataframe inside application state so WebSockets can stream it directly!
        request.app.state.uploaded_df = df
        request.app.state.stream_index = 0

        return {
            "status": "success",
            "filename": file.filename,
            "parsed_rows": len(df),
            "columns": list(df.columns),
            "message": "File accurately deployed to stream pipeline."
        }
    except Exception as e:
        logger.error(f"Error parsing uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process EEG file.")
