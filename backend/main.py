from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from transformers import pipeline
import torch
import json
import asyncio
import random
import os
from datetime import datetime, timedelta

app = FastAPI()

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI model
print("Initializing AI models...")
classifier = pipeline("text-classification", model="facebook/bart-large-mnli")
generator = pipeline("text-generation", model="gpt2")
print("AI models initialized successfully!")

class QueryRequest(BaseModel):
    query: str
    context: Dict[str, Any]

class SuggestionRequest(BaseModel):
    query: str

def generate_mock_data(visualization_type: str) -> Dict[str, Any]:
    """Generate mock data based on visualization type"""
    # Generate fewer data points (30 instead of 100)
    dates = [(datetime.now() - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(30)]
    dates.reverse()
    
    if visualization_type == 'area':
        return {
            'dates': dates,
            'revenue': [random.randint(1000, 5000) for _ in range(30)],
            'costs': [random.randint(500, 2000) for _ in range(30)],
            'profit': [random.randint(500, 3000) for _ in range(30)]
        }
    elif visualization_type == 'bar':
        return {
            'categories': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'values': [random.randint(100, 1000) for _ in range(6)]
        }
    else:  # line
        return {
            'dates': dates,
            'values': [random.randint(100, 1000) for _ in range(30)]
        }

def determine_visualization_type(query: str) -> Dict[str, Any]:
    """Determine the best visualization type based on the query"""
    print(f"Determining visualization type for query: {query}")
    query_lower = query.lower()
    
    # Check for specific visualization types in the query
    if "bar" in query_lower or "bars" in query_lower:
        return {
            "type": "bar",
            "title": "Bar Chart Analysis",
            "description": "Shows comparison between metrics",
            "metrics": ["value", "target"],
            "aggregation": "average"
        }
    elif "area" in query_lower or "filled" in query_lower:
        return {
            "type": "area",
            "title": "Area Chart Analysis",
            "description": "Shows the trend over time with filled area",
            "metrics": ["value", "target"],
            "aggregation": "sum"
        }
    elif "line" in query_lower or "lines" in query_lower:
        return {
            "type": "line",
            "title": "Line Chart Analysis",
            "description": "Shows the progression over time",
            "metrics": ["value"],
            "aggregation": "sum"
        }
    
    # Check for specific analysis types
    if "trend" in query_lower or "over time" in query_lower or "growth" in query_lower:
        return {
            "type": "area",
            "title": "Trend Analysis",
            "description": "Shows the trend over time",
            "metrics": ["value", "target"],
            "aggregation": "sum"
        }
    elif "comparison" in query_lower or "vs" in query_lower or "compare" in query_lower:
        return {
            "type": "bar",
            "title": "Comparison Analysis",
            "description": "Shows comparison between metrics",
            "metrics": ["value", "target"],
            "aggregation": "average"
        }
    elif "distribution" in query_lower or "spread" in query_lower:
        return {
            "type": "bar",
            "title": "Distribution Analysis",
            "description": "Shows the distribution of values",
            "metrics": ["value"],
            "aggregation": "count"
        }
    else:
        # Default to line chart for general queries
        return {
            "type": "line",
            "title": "Time Series Analysis",
            "description": "Shows the progression over time",
            "metrics": ["value"],
            "aggregation": "sum"
        }

def generate_insights(data: Dict[str, Any], visualization_type: str) -> List[str]:
    """Generate insights based on the data and visualization type"""
    insights = []
    
    # Calculate basic statistics
    values = data["values"]
    growth_rates = data["growth"]
    avg_growth = sum(growth_rates[1:]) / (len(growth_rates) - 1) if len(growth_rates) > 1 else 0
    
    # Generate insights based on visualization type
    if visualization_type == 'bar':
        # Bar chart insights (comparison)
        max_value = max(values)
        min_value = min(values)
        insights.append(f"Highest value: {max_value:,.0f}")
        insights.append(f"Lowest value: {min_value:,.0f}")
        insights.append(f"Average value: {sum(values) / len(values):,.0f}")
        
        if "target" in data:
            target_achievement = sum(1 for v, t in zip(values, data["target"]) if v >= t) / len(values) * 100
            insights.append(f"Target achievement rate: {target_achievement:.1f}%")
    
    elif visualization_type == 'area':
        # Area chart insights (trend)
        if avg_growth > 0:
            insights.append(f"Positive growth trend with average growth rate of {avg_growth:.1f}%")
        else:
            insights.append(f"Negative growth trend with average growth rate of {avg_growth:.1f}%")
        
        if "target" in data:
            current_vs_target = (values[-1] / data["target"][-1] - 1) * 100
            insights.append(f"Current value is {current_vs_target:+.1f}% of target")
    
    else:  # line chart
        # Line chart insights (time series)
        if avg_growth > 0:
            insights.append(f"Overall upward trend with {avg_growth:.1f}% average growth")
        else:
            insights.append(f"Overall downward trend with {avg_growth:.1f}% average growth")
        
        # Add trend direction
        if values[-1] > values[0]:
            insights.append("Values have increased over the period")
        else:
            insights.append("Values have decreased over the period")
    
    # Add general insights
    if max(growth_rates) > 10:
        insights.append("Significant growth spikes observed")
    if min(growth_rates) < -10:
        insights.append("Significant decline periods observed")
    
    return insights

@app.get("/api/process-query")
async def process_query(query: str):
    """Process a query and return streaming results"""
    print(f"Processing query: {query}")
    
    async def generate():
        try:
            # Determine visualization type
            visualization = determine_visualization_type(query)
            print(f"Selected visualization type: {visualization['type']}")
            
            # Generate mock data based on visualization type
            if visualization['type'] == 'bar':
                # Generate data suitable for bar chart (comparison)
                data = {
                    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "values": [random.randint(1000, 5000) for _ in range(6)],
                    "target": [random.randint(1000, 5000) for _ in range(6)]
                }
            elif visualization['type'] == 'area':
                # Generate data suitable for area chart (trend)
                base_value = random.randint(1000, 5000)
                values = [base_value + random.randint(-500, 500) for _ in range(6)]
                data = {
                    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "values": values,
                    "target": [v + random.randint(-200, 200) for v in values]
                }
            else:  # line chart
                # Generate data suitable for line chart (time series)
                base_value = random.randint(1000, 5000)
                values = [base_value + random.randint(-500, 500) for _ in range(6)]
                data = {
                    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "values": values,
                    "target": [v + random.randint(-200, 200) for v in values]
                }
            
            # Calculate growth rates
            data["growth"] = [
                ((data["values"][i] - data["values"][i-1]) / data["values"][i-1] * 100)
                if i > 0 else 0
                for i in range(len(data["values"]))
            ]
            
            # Generate insights based on the data
            insights = generate_insights(data, visualization['type'])
            
            # Yield the results
            yield f"data: {json.dumps({'data': data, 'visualization': visualization, 'insights': insights})}\n\n"
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"
            
        except Exception as e:
            print(f"Error in generate function: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        }
    )

@app.get("/api/suggestions")
@app.post("/api/suggestions")
async def get_suggestions(query: str = Query(None), request: SuggestionRequest = None):
    try:
        # Use a smaller set of suggestions
        analytics_suggestions = {
            "revenue": [
                "Show revenue trends",
                "Revenue by category",
                "Revenue growth rate"
            ],
            "users": [
                "User growth rate",
                "Active users",
                "User retention"
            ],
            "performance": [
                "System performance",
                "Response times",
                "Error rates"
            ],
            "default": [
                "Show revenue trends",
                "User growth rate",
                "System performance"
            ]
        }
        
        # Get query from either GET parameter or POST body
        query_text = query or (request.query if request else '')
        print(f"Received suggestions request - Query: {query_text}")
        print(f"Request type: {'GET' if query else 'POST'}")
        
        if not query_text:
            return {"suggestions": analytics_suggestions["default"]}
            
        # Simplified matching logic
        query = query_text.lower()
        matched_suggestions = []
        
        for category, suggestions in analytics_suggestions.items():
            if query in category or any(query in s.lower() for s in suggestions):
                matched_suggestions.extend(suggestions)
        
        # Return unique suggestions, limited to 5
        return {"suggestions": list(set(matched_suggestions))[:5]}
    except Exception as e:
        print(f"Error getting suggestions: {str(e)}")
        return {"suggestions": analytics_suggestions["default"]}

# Add a health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "message": "Server is running",
        "version": "1.0.0"
    }

# Add OPTIONS handler for all routes
@app.options("/{path:path}")
async def options_handler():
    return {
        "status": "ok",
        "headers": {
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=5000) 