const form = document.getElementById("form");
const FASTA = "fasta";
form.addEventListener("submit", submitForm);
const uploadText = "Upload a FASTA file to begin extracting features from your sequence"; 
let proteinFrames = $("input[name='frames']:checked").val();

$("#all").on("change", function() {
    let boxes = $("input[type='checkbox']");
    boxes.prop("checked", this.checked);
    hiddenInput();
});

$("#prot").on("change", hiddenInput); 
function hiddenInput() {
    if ($("#prot").is(':checked')) {
        $("#hidden-input").css('visibility', 'visible');
        $('input[name="frames"]').change(function() {
            proteinFrames = $("input[name='frames']:checked").val();
        });
    }
    else {
        $("#hidden-input").css('visibility', 'hidden');
    }
}

function submitForm(e) {
    e.preventDefault();
    const file = $("#file"); 

    const formData = new FormData();

    $('.opt').each(function(obj) {
        const value = $(this).val();
        const checked = $(this).is(':checked');
        formData.append(value, checked);
    });
    formData.append('protFrames', proteinFrames);

    if (file.val() != "") {
        const fasta =  file.prop('files')[0]; 
        if (isValidFASTA(fasta)) {
            formData.append("file", fasta);
            $("#upload-text").html(fasta.name);
            sendFile(formData); 
        }
        else {      
            $("#upload-text").html("<div class='red'>Uploaded file does not have .fasta extension! </div>" + uploadText);           
        }
    } else {
        $("#upload-text").html(
            "<span class='red'>No file selected! </span><span class = 'value'>" + uploadText);      
    }
}
function isValidFASTA(fasta) {
    console.log(fasta.name.toLowerCase());
    const extension = fasta.name.split('.');
    return extension[extension.length - 1] === FASTA; 
}

function sendFile(formData) {
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

function handleData(data) {
    console.log(data); 
    let div = `<div class = 'space'>`; 
    div += `<p>> ${data.name} </span></p>`
    if (data.len) {
        console.log("data.len is not null"); 
        console.log(data.len);
        div += `<p><span class = 'key'>Length:</span>
        <span class = 'value'> ${data.len}</span></p>`;
    }
    if (data.gc) {
        div += `<p><span class = 'key'>GC Ratio:</span>
        <span class = 'value'> ${data.gc}</span></p>`;
    }
    if (data.gcat.length > 0) {
        div += `<p><span class = 'key'>Nucleotide Frequency:</span>
        <span class = 'value'> ${data.gcat}</span></p>`;
    }
    if (data.compl) {
        div += `<p><span class = 'key'>Complement:</span>
        <span class = 'value'> ${data.compl}</span></p>`;
    }
    if (data.rev) {
        div += `<p><span class = 'key'>Reverse:</span>
        <span class = 'value'>${data.rev}</span></p>`;
    }
    if (data.revcompl) {
        div += `<p><span class = 'key'>Reverse Complement:</span>
        <span class = 'value'> ${data.revcompl}</span></p>`;
    }
    if (data.prot) {
        let aa = Object.entries(data.prot)
        .map(([key, value]) => `<div><span class = 'black'>${key}:</span> ${value}</div>`)
        .join('');

        div += `<div><span class = 'key'>Amino Acid Seq:</span>
        <span class = 'value'> ${aa}</span></div>`;
    }
    div += "</div>"
    $("#box4").html(div); 
}
