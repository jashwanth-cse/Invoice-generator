document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("invoiceForm");
    const preview = document.getElementById("preview");
    const invoiceContent = document.getElementById("invoiceContent");

    const updateItemLabels = () => {
        const items = document.querySelectorAll("#items .item");
        items.forEach((item, index) => {
            item.querySelector(".item-label").textContent = `Item ${index + 1}`;
        });
    };

    const removeItem = (event) => {
        event.target.closest(".item").remove();
        updateItemLabels();
    };

    document.getElementById("addItem").addEventListener("click", () => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        itemDiv.innerHTML = `
            <label class="item-label">Item ${document.querySelectorAll("#items .item").length + 1}</label>
            <label>Description: <input type="text" name="description" required></label>
            <label>Quantity: <input type="number" name="quantity" min="1" required></label>
            <label>Rate: <input type="number" name="rate" min="0" step="0.01" required></label>
            <label>GST (%): <input type="number" name="gst" class="gst" min="0" step="0.01" required></label>
            <button type="button" class="removeItem">Remove</button>
        `;
        document.getElementById("items").appendChild(itemDiv);
        itemDiv.querySelector(".removeItem").addEventListener("click", removeItem);
        updateItemLabels();
    });

    document.querySelectorAll(".removeItem").forEach(button => {
        button.addEventListener("click", removeItem);
    });

    document.getElementById("setSameGst").addEventListener("click", () => {
        const gstValue = parseFloat(document.getElementById("sameGstValue").value);
        document.querySelectorAll("#items .item .gst").forEach(gstInput => {
            gstInput.value = gstValue;
        });
    });

    document.getElementById("generatePreview").addEventListener("click", () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const companyName = document.getElementById("companyName").value;
        const companyAddress = document.getElementById("companyAddress").value;
        const companyPhone = document.getElementById("companyPhone").value;
        const companyGST = document.getElementById("companyGST").value;

        const buyerName = document.getElementById("buyerName").value;
        const buyerAddress = document.getElementById("buyerAddress").value;
        const buyerPhone = document.getElementById("buyerPhone").value;
        const buyerGST = document.getElementById("buyerGST").value;

        const invoiceNo = document.getElementById("invoiceNo").value;
        const invoiceDate = document.getElementById("invoiceDate").value;
        const discount = parseFloat(document.getElementById("discount").value) || 0;

        const items = Array.from(document.querySelectorAll("#items .item"));
        let itemsHtml = "";
        let gstHtml = "";
        let totalAmount = 0;
        let totalTax = 0;
        items.forEach((item, index) => {
            const description = item.querySelector("input[name='description']").value;
            const quantity = item.querySelector("input[name='quantity']").value;
            const rate = item.querySelector("input[name='rate']").value;
            const gst = item.querySelector("input[name='gst']").value;

            const amount = quantity * rate;
            const gstAmount = (amount * gst) / 100;
            const cgst = gstAmount / 2;
            const sgst = gstAmount / 2;
            const total = amount + gstAmount;

            itemsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${description}</td>
                    <td>${quantity}</td>
                    <td>${rate}</td>
                    <td>${amount.toFixed(2)}</td>
                </tr>
            `;

            gstHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${description}</td>
                    <td>${gst}%</td>
                    <td>${cgst.toFixed(2)}</td>
                    <td>${sgst.toFixed(2)}</td>
                    <td>${gstAmount.toFixed(2)}</td>
                </tr>
            `;

            totalAmount += total;
            totalTax += gstAmount;
        });

        totalAmount = Math.round(totalAmount);
        const discountAmount = (totalAmount * discount) / 100;
        const finalAmount = totalAmount - discountAmount;

        invoiceContent.innerHTML = `
            <h2 style="text-align: center;">Tax Invoice</h2>
            <h3>${companyName}</h3>
            <p>${companyAddress}</p>
            <p>Phone: ${companyPhone}${companyGST ? `, GSTIN/UIN: ${companyGST}` : ''}</p>
            <hr>
            <table border="1" style="width: 100%; margin-bottom: 20px;">
                <tr>
                    <td><strong>Invoice No:</strong> ${invoiceNo}</td>
                    <td><strong>Invoice Date:</strong> ${invoiceDate}</td>
                </tr>
            </table>
            <h4>Bill To:</h4>
            <strong><p>${buyerName}</p></strong>
            <p>${buyerAddress}</p>
            <p>Phone: ${buyerPhone}${buyerGST ? `, GSTIN/UIN: ${buyerGST}` : ''}</p>
            <hr>
            <h4>Items</h4>
            <table border="1">
                <thead>
                    <tr>
                        <th>Sl.no</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <h4>GST Details</h4>
            <table border="1">
                <thead>
                    <tr>
                        <th>Sl.no</th>
                        <th>Description</th>
                        <th>GST (%)</th>
                        <th>CGST</th>
                        <th>SGST</th>
                        <th>Total GST</th>
                    </tr>
                </thead>
                <tbody>
                    ${gstHtml}
                </tbody>
            </table>
            <h4>Total Tax: ₹${totalTax.toFixed(2)}</h4>
            <h4>Discount: ${discount}%</h4>
            <h4>Discount Amount: ₹${discountAmount.toFixed(2)}</h4>
            <h3>Total Amount (including tax): ₹${finalAmount.toFixed(2)}</h3>
            <footer><p style="text-align: center; margin-top: 20px;">This is a Computer Generated Invoice</p></footer>
        `;

        preview.style.display = "block";
        form.style.display = "none";
    });

    document.getElementById("editInvoice").addEventListener("click", () => {
        preview.style.display = "none";
        form.style.display = "block";
    });

    document.getElementById("downloadPdf").addEventListener("click", () => {
        const element = document.getElementById("invoiceContent");
        html2pdf().from(element).save("invoice.pdf");
    });

    document.getElementById("printInvoice").addEventListener("click", () => {
        const element = document.getElementById("invoiceContent");
        html2pdf().from(element).toPdf().get('pdf').then((pdf) => {
            window.open(pdf.output('bloburl'), '_blank');
        });
    });
});
