#!/usr/bin/env python3
import subprocess
import getpass
import requests

def main():
    token = getpass.getpass("Enter your GitHub token: ").strip()
    
    # Get username
    headers = {"Authorization": f"token {token}"}
    user_response = requests.get("https://api.github.com/user", headers=headers)
    username = user_response.json()["login"]
    print(f"Username: {username}")
    
    # Update package.json
    with open("package.json", "r") as f:
        content = f.read()
    content = content.replace(
        '"homepage": "https://omarsaid.github.io/BookFlipper"',
        f'"homepage": "https://{username}.github.io/BookFlipper"'
    )
    with open("package.json", "w") as f:
        f.write(content)
    
    print("\n🔧 Manual steps to complete deployment:")
    print("1. Run these commands:")
    print("   git add .")
    print('   git commit -m "Update homepage"')
    print(f"   git remote set-url origin https://{username}:{token}@github.com/{username}/BookFlipper.git")
    print("   git push -u origin main")
    print("\n2. Go to GitHub repository settings > Pages")
    print("3. Set source to 'GitHub Actions'")
    print(f"\n4. Your site will be at: https://{username}.github.io/BookFlipper")

if __name__ == "__main__":
    main()