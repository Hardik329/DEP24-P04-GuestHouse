import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import pdfFont from "../forms/Ubuntu-R.ttf";
import iconsFont from "../forms/Wingdings2.ttf";

export const generateFilledPDF = async (formData) => {
  try {
    // Assuming this URL and fetch operation work correctly
    const fontBytes = await fetch(pdfFont).then((res) => res.arrayBuffer());
    const fontBytesIcons = await fetch(iconsFont).then((res) =>
      res.arrayBuffer()
    );

    // Fetch the PDF from a URL or local assets (adjust the URL as needed)
    const pdfUrl = `${process.env.PUBLIC_URL}/forms/Register_Form.pdf`;
    const pdfData = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfData);

    pdfDoc.registerFontkit(fontkit);
    const ubuntuFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    const pdfIconsFont = await pdfDoc.embedFont(fontBytesIcons, {
      subset: true,
    });

    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1];
    // Example for a few fields, you'll need to add the rest following this pattern
    firstPage.drawText(formData.guestName, {
      x: 165,
      y: 711,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.address, {
      x: 120,
      y: 690,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.numberOfGuests, {
      x: 165,
      y: 670,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.numberOfRooms, {
      x: 460,
      y: 670,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.roomType, {
      x: 350,
      y: 650,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.arrivalDate, {
      x: 90,
      y: 607,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.arrivalTime, {
      x: 210,
      y: 607,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.departureDate, {
      x: 330,
      y: 607,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.departureTime, {
      x: 460,
      y: 607,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });

    var tick = "P";
    if (formData.category === "A") {
      //check for the approvals in the  reviewers section
      if(formData.reviewers){
        formData.reviewers.forEach((reviewer) => {
          if (reviewer.status === "APPROVED") {
            secondPage.drawText(reviewer.role, {
              x: 55,
              y: 510,
              size: 12,
              font: ubuntuFont,
              color: rgb(0, 0, 0),
            })
          }
        });
      }
      firstPage.drawText(tick, {
        x: 125,
        y: 510,
        size: 25,
        font: pdfIconsFont,

        color: rgb(0, 0, 0),
      });
    }
    if (formData.category === "B") {
      if(formData.reviewers){
        formData.reviewers.forEach((reviewer) => {
          if (reviewer.status === "APPROVED") {
            secondPage.drawText(reviewer.role, {
              x: 55,
              y: 510,
              size: 12,
              font: ubuntuFont,
              color: rgb(0, 0, 0),
            })
          }
        });
      }
      firstPage.drawText(tick, {
        x: 255,
        y: 510,
        size: 25,
        font: pdfIconsFont,

        color: rgb(0, 0, 0),
      });
    }
    if (formData.category === "C") {
      if(formData.reviewers){
        formData.reviewers.forEach((reviewer) => {
          if (reviewer.status === "APPROVED") {
            secondPage.drawText(reviewer.role, {
              x: 55,
              y: 510,
              size: 12,
              font: ubuntuFont,
              color: rgb(0, 0, 0),
            })
          }
        });
      }
      firstPage.drawText(tick, {
        x: 385,
        y: 510,
        size: 25,
        font: pdfIconsFont,

        color: rgb(0, 0, 0),
      });
    }
    if (formData.category === "D") {
      if(formData.reviewers){
        formData.reviewers.forEach((reviewer) => {
          if (reviewer.status === "APPROVED") {
            secondPage.drawText(reviewer.role, {
              x: 55,
              y: 510,
              size: 12,
              font: ubuntuFont,
              color: rgb(0, 0, 0),
            })
          }
        });
      }
      firstPage.drawText(tick, {
        x: 515,
        y: 510,
        size: 25,
        font: pdfIconsFont,

        color: rgb(0, 0, 0),
      });
    }

    firstPage.drawText(formData.purpose, {
      x: 175,
      y: 585,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    if (formData.source === "GUEST") {
      firstPage.drawText("YES", {
        x: 385,
        y: 345,
        size: 12,
        font: ubuntuFont,
        color: rgb(0, 0, 0),
      });
    } else {
      firstPage.drawText("NO", {
        x: 385,
        y: 345,
        size: 12,
        font: ubuntuFont,
        color: rgb(0, 0, 0),
      });
    }
    firstPage.drawText(formData.applicant.name, {
      x: 55,
      y: 215,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText(formData.applicant.designation, {
      x: 155,
      y: 215,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.applicant.department, {
      x: 255,
      y: 215,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.applicant.code, {
      x: 340,
      y: 215,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(formData.applicant.mobile, {
      x: 440,
      y: 215,
      size: 12,
      font: ubuntuFont,
      color: rgb(0, 0, 0),
    });
    const filledPdfBytes = await pdfDoc.save();
    return filledPdfBytes;
  } catch (error) {
    console.error("Error generating filled PDF:", error);
    throw error; // Ensure error handling is in place
  }
};

export const updateFilledPDF = async (formData) => {
  try {
    // Load existing PDF bytes
    const filledPdfBytes = await generateFilledPDF(formData);
    const blob = new Blob([filledPdfBytes], { type: "application/pdf" });
    return blob;
    // saveAs(blob, 'filled_form.pdf');
  } catch (error) {
    console.error("Error updating filled PDF:", error);
  }
};
