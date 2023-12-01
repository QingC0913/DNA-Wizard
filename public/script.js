const form = document.getElementById("form");
const FASTA = "fasta";
let file = $("#file");
form.addEventListener("submit", submitForm);
const uploadText = "Upload a FASTA file to begin extracting features from your sequence"; 

$("#all").on("change", function() {
    let boxes = $("input[type='checkbox']");
    boxes.prop("checked", this.checked);
    hiddenInput();
});

$("#prot").on("change", hiddenInput); 
function hiddenInput() {
    if ($("#prot").is(':checked')) {
        $("div.hidden-input").css('visibility', 'visible');
    }
    else {
        $("div.hidden-input").css('visibility', 'hidden');
    }
}

file.on("change", function() {
    const fasta =  file.prop('files')[0]; 
    $("#upload-text").html(fasta.name);
    // file = $("#file");
});

function submitForm(e) {
    e.preventDefault();

    const formData = new FormData();
    $('.opt').each(function(obj) {
        const value = $(this).val();
        const checked = $(this).is(':checked');
        formData.append(value, checked);
    });
    let proteinFrames = $("input[name='frames']:checked").val();
    let proteinStyles = $("input[name='styles']:checked").val();    
    formData.append('protFrames', proteinFrames);
    formData.append('protStyles', proteinStyles);

    if (file.val() != "") {
        const fasta =  file.prop('files')[0]; 
        if (isValidFASTA(fasta)) {
            formData.append("file", fasta);
            sendFile(formData); 
        }
        else {      
            $("#upload-text").html("<div class='red'>Uploaded file does not have .fasta extension! </div>");           
        }
    } else {
        $("#upload-text").html(
            "<span class='red'>No file selected! </span>");      
    }
}

function isValidFASTA(fasta) {
    const extension = fasta.name.split('.');
    return extension[extension.length - 1] === FASTA; 
}

function sendFile(formData) {
    const appURL = "http://dna-wizard.us-3.evennode.com/"; 
    // const appURL = "http://localhost:5000/"; 
    fetch(`${appURL}upload_file`, {
    // fetch(`${vercelURL}/upload_file`, {
        method: 'POST',
        body: formData,
    }).then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    }).then(handleData)
    .catch((err) => {
        console.error("Error occurred:", err); 
    })
}

function handleData(data) {
    let div = "";
    let i = 0; 
    data.forEach(seq => {
        i += 1; 
        div += (i % 2 === 0) ? "<div class = 'space'>" : "<div class = 'space2'>"; 
        div += `<p>> ${seq.name} </span></p>`
        div += `<p><span class='key'>Sequence ${seq.index}:</span>
                    <span class = 'value'> ${seq.seq} </span></p>`
        if (seq.len) {
            div += `<p><span class = 'key'>Length:</span>
            <span class = 'value'> ${seq.len}</span></p>`;
        }
        if (seq.gc) {
            div += `<p><span class = 'key'>GC Ratio:</span>
            <span class = 'value'> ${seq.gc}</span></p>`;
        }
        if (seq.gcat.length > 0) {
            div += `<p><span class = 'key'>Nucleotide Frequency:</span>
            <span class = 'value'>`; 
            labels = ['A', 'C', 'G', 'T']; 
            for (let i = 0; i < labels.length; i++) {
                div += `<span>${labels[i]}: </span>${seq.gcat[i]}&nbsp;&nbsp;&nbsp;`; 
            }
            div += `</span></p>`;
        }
        if (seq.compl) {
            div += `<p><span class = 'key'>Complement:</span>
            <span class = 'value'> ${seq.compl}</span></p>`;
        }
        if (seq.rev) {
            div += `<p><span class = 'key'>Reverse:</span>
            <span class = 'value'>${seq.rev}</span></p>`;
        }
        if (seq.revcompl) {
            div += `<p><span class = 'key'>Reverse Complement:</span>
            <span class = 'value'> ${seq.revcompl}</span></p>`;
        }
        if (seq.prot) {
            let aa = Object.entries(seq.prot)
            .map(([key, value]) => `<div>${key}${value}</div>`)
            .join('');
    
            div += `<div><span class = 'key'>Amino Acid Seq:</span>
            <span class = 'value'> ${aa}</span></div>`;
        }
        div += "</div>"
    });
    $("#box4").html(div); 
    $("button.hidden-input").css('visibility', 'visible');
}
