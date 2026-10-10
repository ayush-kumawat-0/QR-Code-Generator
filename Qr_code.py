import io
import os
import qrcode

from flask import Flask, render_template, request, send_file
from PIL import Image, ImageDraw, ImageFont

from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import (
    RoundedModuleDrawer,
    CircleModuleDrawer
)
from qrcode.image.styles.colormasks import SolidFillColorMask

app = Flask(__name__)


# -----------------------------------
# HOME
# -----------------------------------

@app.route("/")
def home():
    return render_template("qrCode.html")


# -----------------------------------
# CREATE CENTER ICON
# -----------------------------------

# def create_qr_icon(logo_type, color, size):

#     solid_font_path = os.path.join(
#         app.root_path,
#         "static",
#         "fonts",
#         "fa-solid-900.ttf"
#     )

#     brand_font_path = os.path.join(
#         app.root_path,
#         "static",
#         "fonts",
#         "fa-brands-400.ttf"
#     )

#     icon_size = int(size * 0.50)

#     # Website / Link
#     if logo_type == "website":

#         font = ImageFont.truetype(
#             solid_font_path,
#             icon_size
#         )

#         glyph = "\uf0c1"
#         icon_color = color

#     # WhatsApp
#     elif logo_type == "whatsapp":

#         font = ImageFont.truetype(
#             brand_font_path,
#             icon_size
#         )

#         glyph = "\uf232"
#         icon_color = "#22c55e"

#     # Location
#     elif logo_type == "location":

#         font = ImageFont.truetype(
#             solid_font_path,
#             icon_size
#         )

#         glyph = "\uf3c5"
#         icon_color = color

#     # Email
#     elif logo_type == "email":

#         font = ImageFont.truetype(
#             solid_font_path,
#             icon_size
#         )

#         glyph = "\uf0e0"
#         icon_color = color

#     else:
#         return None

#     # Transparent icon image
#     icon = Image.new(
#         "RGBA",
#         (size, size),
#         (0, 0, 0, 0)
#     )

#     draw = ImageDraw.Draw(icon)

#     bbox = draw.textbbox(
#         (0, 0),
#         glyph,
#         font=font
#     )

#     text_width = bbox[2] - bbox[0]
#     text_height = bbox[3] - bbox[1]

#     x = (size - text_width) / 2 - bbox[0]
#     y = (size - text_height) / 2 - bbox[1]

#     draw.text(
#         (x, y),
#         glyph,
#         font=font,
#         fill=icon_color
#     )

#     return icon


# -----------------------------------
# GENERATE QR
# -----------------------------------

@app.route("/generate", methods=["POST"])
def generate():

    # -----------------------------------
    # GET FORM DATA
    # -----------------------------------

    content = request.form.get("content")

    if not content:
        return {"error": "Content is required"}, 400

    foreground = request.form.get(
        "foreground",
        "#000000"
    )

    background = request.form.get(
        "background",
        "#ffffff"
    )

    dot_style = request.form.get(
        "dot_style",
        "square"
    )


    # -----------------------------------
    # GET UPLOADED LOGO
    # -----------------------------------

    logo_file = request.files.get("logo")


    print("CONTENT:", content)
    print("DOT STYLE:", dot_style)

    if logo_file:
        print("LOGO:", logo_file.filename)


    # -----------------------------------
    # CREATE QR OBJECT
    # -----------------------------------

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=1
    )

    qr.add_data(content)
    qr.make(fit=True)


    # -----------------------------------
    # SELECT QR DOT STYLE
    # -----------------------------------

    if dot_style == "rounded":
        image = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(radius_ratio=0.8),
        color_mask=SolidFillColorMask(
            front_color=tuple(int(foreground.lstrip('#')[i:i+2], 16) for i in (0,2,4)),
            back_color=tuple(int(background.lstrip('#')[i:i+2], 16) for i in (0,2,4))
        )
    )

    elif dot_style == "soft":
        image = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=CircleModuleDrawer(),
            color_mask=SolidFillColorMask(
                front_color=tuple(int(foreground.lstrip('#')[i:i+2], 16) for i in (0,2,4)),
                back_color=tuple(int(background.lstrip('#')[i:i+2], 16) for i in (0,2,4))
            )
        )
    
    else:
        image = qr.make_image(
            fill_color=foreground,
            back_color=background
        )


    # Convert to RGBA
    image = image.convert("RGBA")


    # -----------------------------------
    # OLD CENTER LOGO CODE
    # -----------------------------------

    # if logo_type != "none":

    #     print("Adding center logo:", logo_type)

    #     # Badge size
    #     badge_size = int(image.width * 0.15)

    #     # Create transparent badge
    #     badge = Image.new(
    #         "RGBA",
    #         (badge_size, badge_size),
    #         (0, 0, 0, 0)
    #     )

    #     badge_draw = ImageDraw.Draw(badge)

    #     # Border width
    #     border_width = max(
    #         1,
    #         int(image.width * 0.012)
    #     )

    #     # Circular background + border
    #     badge_draw.ellipse(
    #         (
    #             0,
    #             0,
    #             badge_size - 1,
    #             badge_size - 1
    #         ),
    #         fill=background,
    #         outline=foreground,
    #         width=border_width
    #     )

    #     # Create Font Awesome icon
    #     icon = create_qr_icon(
    #         logo_type,
    #         foreground,
    #         badge_size
    #     )

    #     if icon is not None:

    #         icon = icon.convert("RGBA")

    #         # Put icon inside badge
    #         badge.alpha_composite(icon)

    #         # Center badge on QR
    #         x = (image.width - badge_size) // 2
    #         y = (image.height - badge_size) // 2

    #         # Put badge on QR
    #         image.alpha_composite(
    #             badge,
    #             (x, y)
    #         )


    # -----------------------------------
    # ADD UPLOADED LOGO
    # -----------------------------------

    if logo_file:

        # Open uploaded logo
        logo = Image.open(logo_file).convert("RGBA")


        # -----------------------------------
        # RESIZE LOGO
        # -----------------------------------

        logo_size = int(image.width * 0.15)

        logo.thumbnail(
            (logo_size, logo_size),
            Image.Resampling.LANCZOS
        )


        # -----------------------------------
        # CENTER LOGO
        # -----------------------------------

        x = (image.width - logo.width) // 2
        y = (image.height - logo.height) // 2


        # -----------------------------------
        # ADD LOGO TO QR
        # -----------------------------------

        image.alpha_composite(
            logo,
            (x, y)
        )


    # -----------------------------------
    # RETURN PNG
    # -----------------------------------

    output = io.BytesIO()

    image.save(
        output,
        format="PNG"
    )

    output.seek(0)

    return send_file(
        output,
        mimetype="image/png",
        download_name="qr-code.png"
    )


# -----------------------------------
# RUN FLASK
# -----------------------------------

if __name__ == "__main__":
    app.run(debug=True)