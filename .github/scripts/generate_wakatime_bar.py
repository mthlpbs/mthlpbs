#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Custom script to generate Wakatime-style language bar from Hackatime API
"""

import requests
import os
import sys
import json
from datetime import datetime

def create_language_bar(languages, max_languages=5):
    """Create a text-based language bar similar to markscribe output."""
    if not languages:
        return "No language data available"
    
    # Sort languages by total_seconds and take top max_languages
    sorted_languages = sorted(languages[:max_languages], key=lambda x: x['total_seconds'], reverse=True)
    
    # Find the maximum seconds for calculating bar width
    max_seconds = max(lang['total_seconds'] for lang in sorted_languages) if sorted_languages else 1
    
    lines = []
    for lang in sorted_languages:
        name = lang['name']
        seconds = lang['total_seconds']
        percent = lang['percent']
        text = lang['text']
        
        # Calculate bar length based on percentage (25 characters max)
        bar_length = int(percent / 4)  # 100% = 25 chars, so divide by 4
        filled_bar = '█' * bar_length
        empty_bar = '░' * (25 - bar_length)
        bar = filled_bar + empty_bar
        
        # Format the line with proper alignment
        line = f"{name:<12} {text:>13} {bar} {percent:>6.2f}%"
        lines.append(line)
    
    return '\n'.join(lines)

def merge_language_data(all_time_data, weekly_data):
    """Merge weekly data into all-time data."""
    language_totals = {}
    
    # Add existing all-time data
    for lang in all_time_data.get('languages', []):
        language_totals[lang['name']] = lang['total_seconds']
    
    # Add current week's data
    for lang in weekly_data:
        if lang['name'] in language_totals:
            # Take the maximum (in case of overlap)
            language_totals[lang['name']] = max(language_totals[lang['name']], lang['total_seconds'])
        else:
            language_totals[lang['name']] = lang['total_seconds']
    
    # Calculate total seconds and percentages
    total_seconds = sum(language_totals.values())
    
    languages = []
    for name, seconds in language_totals.items():
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        text = f"{hours} hrs {minutes:02d} mins" if hours > 0 else f"{minutes:02d} mins"
        percent = (seconds / total_seconds * 100) if total_seconds > 0 else 0
        
        languages.append({
            'name': name,
            'total_seconds': seconds,
            'text': text,
            'percent': percent
        })
    
    # Sort by total_seconds
    languages.sort(key=lambda x: x['total_seconds'], reverse=True)
    
    # Calculate total time
    total_hours = total_seconds // 3600
    total_minutes = (total_seconds % 3600) // 60
    total_text = f"{total_hours} hrs {total_minutes:02d} mins" if total_hours > 0 else f"{total_minutes:02d} mins"
    
    return {
        'languages': languages,
        'total_seconds': total_seconds,
        'human_readable_total': total_text,
        'last_updated': datetime.now().isoformat()
    }

def load_all_time_data():
    """Load all-time data from storage file."""
    storage_file = '.github/data/all_time_stats.json'
    try:
        with open(storage_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {'languages': [], 'total_seconds': 0, 'human_readable_total': '0 mins'}

def save_all_time_data(data):
    """Save all-time data to storage file."""
    storage_file = '.github/data/all_time_stats.json'
    os.makedirs(os.path.dirname(storage_file), exist_ok=True)
    
    with open(storage_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def fetch_stats(api_key, api_url, time_range):
    """Fetch stats for a given time range."""
    headers = {'Authorization': f'Bearer {api_key}'}
    url = f"{api_url}/users/current/stats/{time_range}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return None

def main():
    api_key = os.getenv('WAKATIME_API_KEY')
    api_url = os.getenv('WAKATIME_URL', 'https://hackatime.hackclub.com/api/hackatime/v1')
    
    if not api_key:
        print("Error: WAKATIME_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)
    
    # Try to fetch last 7 days data
    weekly_data = fetch_stats(api_key, api_url, 'last_7_days')
    
    if not weekly_data:
        print("Error: Could not fetch weekly data from API", file=sys.stderr)
        sys.exit(1)
    
    # Extract weekly data
    weekly_stats = weekly_data.get('data', {})
    weekly_languages = weekly_stats.get('languages', [])
    weekly_total = weekly_stats.get('human_readable_total', 'N/A')
    
    # Generate weekly stats only
    print("📊 **This Week's Coding Languages:**")
    print("```")
    weekly_bar = create_language_bar(weekly_languages)
    print(weekly_bar)
    print("```")
    print(f"**Total Time This Week:** {weekly_total}")
    print()
    print(f"*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC*")
    
    # Ensure proper UTF-8 output
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

if __name__ == '__main__':
    main()