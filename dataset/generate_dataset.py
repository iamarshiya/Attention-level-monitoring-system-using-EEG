import csv
import random
from datetime import datetime, timedelta
import math

# Parameters for realistic simulation at 256Hz for 60 seconds
freq = 256
duration_seconds = 60
num_samples = freq * duration_seconds
channels = ['TP9', 'AF7', 'AF8', 'TP10'] # Muse headband channels

# Helper to generate simulated EEG containing alpha/beta/theta mix
def generate_signal(t, is_focused):
    # Base noise
    val = random.uniform(-10, 10)
    
    # If focused, higher Beta (12-30Hz), lower Alpha (8-12Hz)
    # If relaxed/neutral, higher Alpha, lower Beta
    if is_focused:
        val += 5 * math.sin(2 * math.pi * 20 * t) # Beta prominence
        val += 2 * math.sin(2 * math.pi * 10 * t) # Alpha reduction
    else:
        val += 2 * math.sin(2 * math.pi * 20 * t) # Beta reduction
        val += 8 * math.sin(2 * math.pi * 10 * t) # Alpha prominence
        
    # Add slow wave Theta (4-8Hz) generically
    val += 3 * math.sin(2 * math.pi * 6 * t)
    
    return round(val, 3)

start_time = datetime.now()
output_file = 'eeg_attention_dataset.csv'

with open(output_file, mode='w', newline='') as file:
    writer = csv.writer(file)
    headers = ['Timestamp', 'TP9', 'AF7', 'AF8', 'TP10', 'Computed_Attention_Score', 'State']
    writer.writerow(headers)
    
    current_time = start_time
    
    for i in range(num_samples):
        # Time step in seconds
        t = i / freq
        
        # Fluctuate attention state every 15 seconds
        if t < 15:
            state = "Focused"
            score = random.uniform(70, 95)
        elif t < 30:
            state = "Neutral"
            score = random.uniform(40, 69)
        elif t < 45:
            state = "Distracted"
            score = random.uniform(10, 39)
        else:
            state = "Focused"
            score = random.uniform(75, 100)
            
        row = [
            current_time.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3],
            generate_signal(t, state == "Focused"),
            generate_signal(t, state == "Focused"),
            generate_signal(t, state == "Focused"),
            generate_signal(t, state == "Focused"),
            round(score, 1),
            state
        ]
        writer.writerow(row)
        
        # Increment timestamp by 1/256 seconds (~3.9 ms)
        current_time += timedelta(milliseconds=1000/freq)

print(f"Dataset generated successfully: {output_file} ({num_samples} rows)")
