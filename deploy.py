#!/usr/bin/env python3
import subprocess
import sys
import time
import requests
import getpass

def run_command(cmd, cwd=None):
    """Run shell command and return result"""
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running: {cmd}")
        print(f"Error: {result.stderr}")
        return False
    return result.stdout.strip()

def main():
    # Get GitHub credentials
    print("Note: Enter your GitHub USERNAME (not email address)")
    print("Example: if your profile is github.com/johndoe, enter 'johndoe'")
    username = input("Enter your GitHub username: ").strip()
    token = getpass.getpass("Enter your GitHub token (classic): ").strip()
    repo_name = "BookFlipper"
    
    # Validate username
    if '@' in username or '.' in username:
        print("❌ Please enter your GitHub username, not email address")
        print(f"Example: if your GitHub URL is github.com/{username.split('@')[0]}, enter '{username.split('@')[0]}'")
        return
    
    print("🚀 Starting deployment process...")
    
    # Update package.json homepage
    print("📝 Updating package.json homepage...")
    with open("package.json", "r") as f:
        content = f.read()
    
    content = content.replace(
        '"homepage": "https://omarsaid.github.io/BookFlipper"',
        f'"homepage": "https://{username}.github.io/{repo_name}"'
    )
    
    with open("package.json", "w") as f:
        f.write(content)
    
    # Git operations
    print("📦 Committing changes...")
    run_command("git add .")
    run_command('git commit -m "Update homepage for deployment"')
    
    # Create repository if it doesn't exist
    print("📁 Creating GitHub repository...")
    create_repo_data = {
        "name": repo_name,
        "description": "PDF Flip Book Creator",
        "private": False
    }
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.post(
            "https://api.github.com/user/repos",
            json=create_repo_data,
            headers=headers
        )
        if response.status_code == 201:
            print("✅ Repository created successfully!")
        elif response.status_code == 422:
            print("ℹ️ Repository already exists")
        else:
            print(f"⚠️ Repository creation response: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Could not create repository: {e}")
    
    # Add remote and push with token
    print("🔗 Setting up GitHub remote...")
    # Remove existing remote (ignore errors)
    subprocess.run("git remote remove origin", shell=True, capture_output=True)
    
    remote_url = f"https://{token}@github.com/{username}/{repo_name}.git"
    result = run_command(f"git remote add origin {remote_url}")
    if not result:
        print("❌ Failed to add remote. Check your username and token.")
        return
    
    print("⬆️ Pushing to GitHub...")
    result = run_command("git push -u origin main")
    if not result:
        print("❌ Failed to push to GitHub. Check your token permissions.")
        return
    
    print("✅ Code pushed to GitHub successfully!")
    
    # Wait for GitHub Actions
    print("⏳ Waiting for GitHub Actions to deploy (this may take 2-3 minutes)...")
    site_url = f"https://{username}.github.io/{repo_name}"
    
    for i in range(30):  # Wait up to 5 minutes
        time.sleep(10)
        try:
            response = requests.get(site_url, timeout=10)
            if response.status_code == 200:
                print(f"🎉 Site is live at: {site_url}")
                print(f"📄 Pizza menu at: {site_url}/citypizzamenu")
                
                # Test PDF route
                pdf_response = requests.get(f"{site_url}/citypizzamenu", timeout=10)
                if pdf_response.status_code == 200:
                    print("✅ PDF route working correctly!")
                else:
                    print("⚠️ PDF route may need a few more minutes to work")
                
                return
        except requests.RequestException:
            pass
        
        print(f"⏳ Still waiting... ({i+1}/30)")
    
    print("⚠️ Deployment taking longer than expected.")
    print(f"🔧 Enabling GitHub Pages...")
    
    # Enable GitHub Pages via API
    pages_data = {
        "source": {
            "branch": "gh-pages"
        }
    }
    
    try:
        pages_response = requests.post(
            f"https://api.github.com/repos/{username}/{repo_name}/pages",
            json=pages_data,
            headers=headers
        )
        if pages_response.status_code in [201, 409]:
            print("✅ GitHub Pages enabled!")
    except Exception as e:
        print(f"⚠️ Could not enable Pages via API: {e}")
    
    print("Check:")
    print(f"1. GitHub Actions at: https://github.com/{username}/{repo_name}/actions")
    print(f"2. Repository settings > Pages")
    print(f"3. Site should be available at: {site_url}")

if __name__ == "__main__":
    main()