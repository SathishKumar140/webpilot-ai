from PIL import Image, ImageDraw, ImageFont
import io
from typing import Any

def draw_bounding_boxes(image_bytes, elements):
    img = Image.open(io.BytesIO(image_bytes))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("Arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    for element in elements:
        box = element["bounding_box"]
        if box:
            draw.rectangle(
                [box['x'], box['y'], box['x'] + box['width'], box['y'] + box['height']],
                outline="red",
                width=2
            )
            id_text = str(element["id"])
            
            if hasattr(font, 'getbbox'):
                bbox = font.getbbox(id_text)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
            else:
                text_width, text_height = draw.textsize(id_text, font=font)

            text_x = box['x'] + box['width'] - text_width - 5
            text_y = box['y'] + 2
            
            draw.rectangle(
                [text_x - 2, text_y - 2, text_x + text_width + 2, text_y + text_height + 2],
                fill="red"
            )
            draw.text((text_x, text_y), id_text, fill="white", font=font)

    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=95)
    return buf.getvalue()

def check_vulnerabilities(dom_state):
    vulnerabilities = []

    # Check for insecure forms
    for element in dom_state:
        if element['tag'] == 'form':
            action = element.get('action', '')
            if not action.startswith('https'):
                vulnerabilities.append({
                    'label': 'Insecure Form Submission (OWASP A05:2021 - Security Misconfiguration)',
                    'severity': 'High',
                    'description': f"Form with action '{action}' is submitting data over HTTP instead of HTTPS. This can lead to sensitive information being intercepted by attackers.",
                    'owasp_category': 'A05:2021 - Security Misconfiguration'
                })

    # Check for XSS
    for element in dom_state:
        if element['tag'] in ['input', 'textarea']:
            # This is a simplified check. A real-world scenario would involve more complex analysis.
            vulnerabilities.append({
                'label': 'Potential Cross-Site Scripting (XSS) (OWASP A03:2021 - Injection)',
                'severity': 'High',
                'description': f"Input field with id '{element['id']}' might be vulnerable to Cross-Site Scripting (XSS). This occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing attackers to execute malicious scripts in the victim's browser.",
                'owasp_category': 'A03:2021 - Injection'
            })

    return vulnerabilities

def generate_report(vulnerabilities) -> list[dict[str, Any]]:
    """
    Generates a penetration test report as a list of dictionaries (JSON-compatible).
    """
    return vulnerabilities
