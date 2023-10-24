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
            "<span class='red'>No file selected! </span>" + uploadText);      
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
    let div = `<div class = 'space'> > ${data.name} </p>`; 
    if (data.len) {
        console.log("data.len is not null"); 
        console.log(data.len);
        div += `<p>Length: ${data.len}</p>`;
    }
    if (data.gc) {
        div += `<p>GC Ratio: ${data.gc}</p>`;
    }
    if (data.gcat.length > 0) {
        div += `<p>Nucleotide Frequency: ${data.gcat}</p>`;
    }
    if (data.compl) {
        div += `<p>Complement: ${data.compl}</p>`;
    }
    if (data.rev) {
        div += `<p>Reverse: ${data.rev}</p>`;
    }
    if (data.revcompl) {
        div += `<p>Reverse Complement: ${data.revcompl}</p>`;
    }
    if (data.prot) {
        let aa = Object.entries(data.prot)
        .map(([key, value]) => `<div>${key}: ${value}</div>`)
        .join('');

        div += `<div>Amino Acid Seq: ${aa}</div>`;
    }
    div += "</div>"
    $("#box4").html(div); 
}

function f(aa) {
    const labels = ["5'3' Frame 1", "5'3' Frame 2", "5'3' Frame 3", 
                    "3'5' Frame 1", "3'5' Frame 2", "3'5' Frame 3"]; 
    if (aa.length === 1) {
        const dictionary = keys.reduce((acc, key, index) => {
            acc[key] = values[index];
            return acc;
          }, {});
          
          console.log(dictionary);
          
    }
}