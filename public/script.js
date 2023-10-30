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
    let div = "";
    let i = 0; 
    data.forEach(seq => {
        i += 1; 
        div += (i % 2 === 0) ? "<div class = 'space'>" : "<div class = 'space2'>"; 
        console.log(seq);
        div += `<p>> ${seq.name} </span></p>`
        div += `<p><span class='key'>Sequence:</span>
                    <span class = 'value'> ${seq.seq} </span></p>`
        if (seq.len) {
            console.log("seq.len is not null"); 
            console.log(seq.len);
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
                div += `<span class = acgt>${labels[i]}: </span>${seq.gcat[i]}&nbsp;&nbsp;&nbsp;`; 
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
            .map(([key, value]) => `<div><span class = 'black'>${key}</span> ${value}</div>`)
            .join('');
    
            div += `<div><span class = 'key'>Amino Acid Seq:</span>
            <span class = 'value'> ${aa}</span></div>`;
        }
        div += "</div>"
    });
    div = div.replaceAll('-', "<span class = 'red'>-</span>"); 
    div = div.replaceAll('M', "<span class = 'black'>M</span>"); 
    $("#box4").html(div); 
}
