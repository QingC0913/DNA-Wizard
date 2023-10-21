const form = document.getElementById("form");
const FASTA = "fasta";
let hey; 
form.addEventListener("submit", submitForm);
let uploadText = "Upload a FASTA file to begin extracting features from your sequence"; 

const all = $("#all"); 
all.on("change", function() {
    let boxes = $("input[type='checkbox']");
    boxes.prop("checked", this.checked);
});

function submitForm(e) {
    e.preventDefault();
    const file = $("#file"); 

    // console.log(file.val());
    const formData = new FormData();

    $('.opt').each(function(obj) {
        const value = $(this).val();
        const checked = $(this).is(':checked');
        formData.append(value, checked);
    });
    if (file.val() != "") {
        const fasta =  file.prop('files')[0]; 
        if (isValidFASTA(fasta)) {
            formData.append("file", fasta);
            $("#upload-text").html(fasta.name);
            sendFile(formData); 
        }
        else {      
            console.log("NOT FASTA!!!");
            $("#upload-text").html("<span class='red'>Uploaded file does not have .fasta extension! </span>" + uploadText);           
        }
    } else {
        console.log("no file selected");
        $("#upload-text").html(
            "<span class='red'>No file selected! </span>" + uploadText);      
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
    let returnedData; 
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
    // })
    .catch((err) => {
        console.error("Error occurred:", err); 
    })
}