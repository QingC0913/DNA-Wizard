const form = document.getElementById("form");
const FASTA = "fasta";
form.addEventListener("submit", submitForm);

const all = $("#all"); 
all.on("change", function() {
    let boxes = $("input[type='checkbox']");
    boxes.prop("checked", this.checked);
});

function submitForm(e) {
    e.preventDefault();
    const file = $("#file"); 
    const formData = new FormData();

    $('.opt').each(function(obj) {
        const value = $(this).val();
        const checked = $(this).is(':checked');
        formData.append(value, checked);
    });
    if (file.val() != "") {
        const fasta =  file.prop('files')[0]; 
        if (isValidFASTA(fasta)) {
            $("#upload-text").html(fasta.name);
            formData.append("file", fasta);
            console.log("added form content "); 
            sendFile(formData); 
            console.log("sent form");
        }
        else { console.log("NOT FASTA!!!"); }
    } else {
        let text = $("#upload-text").html();
        text = "<span class='red'>No file selected!</span>" + text;
        $("#upload-text").html(text);
    }
}
function isValidFASTA(fasta) {
    console.log(fasta.name.toLowerCase());
    const extension = fasta.name.split('.');
    return extension[extension.length - 1] === FASTA; 
}
function handleData(data) {
    console.log(data); 
    let div = ""; 
    if (data.len) {
        console.log("data.len is not null"); 
        console.log(data.len);
        div += `<div>Length: ${data.len}</div>`;
    }
    if (data.gc) {
        div += `<div>GC Ratio: ${data.gc}</div>`;
    }
    if (data.gcat.length > 0) {
        div += `<div>Nucleotide Frequency: ${data.gcat}</div>`;
    }
    if (data.compl) {
        div += `<div>Complement: ${data.compl}</div>`;
    }
    if (data.rev) {
        div += `<div>Reverse: ${data.rev}</div>`;
    }
    if (data.revcompl) {
        div += `<div>Reverse Complement: ${data.revcompl}</div>`;
    }
    if (data.prot) {
        div += `<div>GC Ratio: ${data.prot}</div>`;
    }
    $("#space").html(div); 
}

function sendFile(formData) {
    console.log(formData);
    fetch("http://localhost:5000/upload_file", {
        // mode: 'no-cors',
        method: 'POST',
        body: formData,
    }).then((res) => {
        console.log(res)
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        console.log("response is ok!");
        return res.json();
    }).then(handleData)
    .catch((err) => {
        console.error("Error occurred:", err); 
    })
}