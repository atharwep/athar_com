import os

new_url = "https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec"
search_dir = r"c:\Users\center_vip\Desktop\nabel\‏‏مجلد جديد - نسخة"

extensions = ('.html', '.js', '.md')

for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith(extensions):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex approach to catch various old versions
                import re
                # Pattern to catch script.google.com/macros/s/.../exec
                pattern = r"https://script\.google\.com/macros/s/AKfycb[a-zA-Z0-9_-]+/exec"
                
                if re.search(pattern, content):
                    new_content = re.sub(pattern, new_url, content)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")
            except Exception as e:
                print(f"Error updating {file_path}: {e}")
