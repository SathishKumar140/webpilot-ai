from PIL import Image, ImageDraw, ImageFont
import io

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
