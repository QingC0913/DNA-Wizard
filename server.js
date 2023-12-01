import express from 'express';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import Fasta from 'biojs-io-fasta';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// app.get('/', (req, res) => {
//   res.send(html);
// })

// Multer middleware for file upload
const upload = multer({ dest: 'uploads/' });

// Handle file upload
app.post("/upload_file", upload.single("file"), uploadFiles);
function uploadFiles(req, res) {
  const body = req.body
  let index = 1; 
  let fasta_file = req.file;
  fs.readFile(fasta_file.path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }  
    // Parse the FASTA content using biojs-io-fasta
    const sequences = Fasta.parse(data);
    let to_return = []; 
    sequences.forEach(sequence => {
      let first = sequence.seq.toUpperCase().trim(); 
      let seqName = sequence.name; 
      let len = null, gcat = [], gc = null, compl = null, rev = null,
          revcompl = null, prot = null; 
      if (body.len === "true") {
        len = length(first); 
      }
      if (body.nfreq === "true") {
        gcat = freq(first);
      }
      if (body.gcratio === "true") {
        if (gcat.length === 0) {
          gc = calc_gc(first); 
        }
        else {
          gc = (gcat[1] + gcat[2]) / length(first) * 100; 
          gc = gc.toFixed(2) + '%';
        }
      }
      if (body.compl === "true") {
        compl = complement(first); 
      }
      if (body.rev === "true") {
        rev = reverse(first);
      }
      if (body.revcompl === "true") {
        revcompl = reverse(complement(first)); 
      }
      if (body.prot === "true") {
        const THREE = 3; 
        const LABELS = ["5'3' Frame 1: ", "5'3' Frame 2: ", "5'3' Frame 3: ", 
                      "3'5' Frame 1: ", "3'5' Frame 2: ", "3'5' Frame 3: "];
        let labs = LABELS.slice(0, body.protFrames);
        let values = []; 
        if (body.protFrames <= THREE) {
          values = aminoAcid(first, body.protFrames, body.protStyles); 
        }
        else {
          let a = aminoAcid(first, THREE, body.protStyles); 
          let b = aminoAcid(reverse(first), THREE, body.protStyles);
          values = a.concat(b);
        }
        prot = labs.reduce((acc, key, index) => {
          acc[key] = values[index];
          return acc;
        }, {});
      }
      let returnObj = {
        seq: first, 
        name: seqName, 
        len: len, 
        gc: gc, 
        gcat: gcat, 
        compl: compl, 
        rev: rev, 
        revcompl: revcompl, 
        prot: prot, 
        index: index
      }
      index += 1; 
      to_return.push(returnObj);
    });
    res.status(200).json(to_return);
  })  
} 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨🌟  Server is running on http://localhost:${PORT}  🌟✨`);
});

function reverse(seq) {
  const reversed = [...seq].reverse().join("");
  return reversed;
}

function length(seq) {
  return seq.length;
}

function complement(seq) {
  let comple = ""; 
  let comp = {
    "A": "T", 
    "C": "G", 
    "G": "C", 
    "T": "A", 
    "U": "A", 
    "N": "N"
  }
  for (let i = 0; i < seq.length; i++) {
    let ch = seq[i]; 
    comple += comp[ch]; 
  }
  return comple;
}

function freq(seq) {
  let len = seq.length; 
  let a = 0, c = 0, g = 0, t = 0;  
  for (let i = 0; i < len; i++) {
    let ch = seq[i]; 
    if (ch == 'A') 
      a += 1; 
    else if (ch == 'C') 
      c += 1;
    else if (ch == 'G') 
      g += 1; 
    else if (ch == 'T')
      t += 1; 
  }
  return [a, c, g, t];
}

function calc_gc(seq) {
  let len = seq.length; 
  let count = 0;  
  for (let i = 0; i < len; i++) {
    let ch = seq[i]; 
    if (ch == 'C' || ch == 'G') 
      count += 1; 
  }
  return (count / len); 
}

function aminoAcid(seq, frames, style) {
  seq = seq.replace(/T/g, 'U');
  let aa;  
  if (style === 'c') {
    aa = {
      "UUU": "F", "UUC": "F", "UUA": "L", "UUG": "L", 
      "UCU": "S", "UCC": "S", "UCA": "S", "UCG": "S",
      "UAU": "Y", "UAC": "Y", "UAA": "-", "UAG": "-",
      "UGU": "C", "UGC": "C", "UGA": "-", "UGG": "W",
      "CUU": "L", "CUC": "L", "CUA": "L", "CUG": "L",
      "CCU": "P", "CCC": "P", "CCA": "P", "CCG": "P",
      "CAU": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
      "CGU": "R", "CGC": "R", "CGA": "R", "CGG": "R",
      "AUU": "I", "AUC": "I", "AUA": "I", "AUG": "M",
      "ACU": "T", "ACC": "T", "ACA": "T", "ACG": "T",
      "AAU": "N", "AAC": "N", "AAA": "K", "AAG": "K",
      "AGU": "S", "AGC": "S", "AGA": "R", "AGG": "R",
      "GUU": "V", "GUC": "V", "GUA": "V", "GUG": "V",
      "GCU": "A", "GCC": "A", "GCA": "A", "GCG": "A",
      "GAU": "D", "GAC": "D", "GAA": "E", "GAG": "E",
      "GGU": "G", "GGC": "G", "GGA": "G", "GGG": "G"
    }
  } else if (style === 'v') {
    aa = {
      "UUU": "Phe ", "UUC": "Phe ", "UUA": "Leu ", "UUG": "Leu ", 
      "UCU": "Ser ", "UCC": "Ser ", "UCA": "Ser ", "UCG": "Ser ",
      "UAU": "Tyr ", "UAC": "Tyr ", "UAA": "Stop ", "UAG": "Stop ",
      "UGU": "Cys ", "UGC": "Cys ", "UGA": "Stop ", "UGG": "Trp ",
      "CUU": "Leu ", "CUC": "Leu ", "CUA": "Leu ", "CUG": "Leu ",
      "CCU": "Pro ", "CCC": "Pro ", "CCA": "Pro ", "CCG": "Pro ",
      "CAU": "His ", "CAC": "His ", "CAA": "Gln ", "CAG": "Gln ",
      "CGU": "Arg ", "CGC": "Arg ", "CGA": "Arg ", "CGG": "Arg ",
      "AUU": "Ile ", "AUC": "Ile ", "AUA": "Ile ", "AUG": "Met ",
      "ACU": "Thr ", "ACC": "Thr ", "ACA": "Thr ", "ACG": "Thr ",
      "AAU": "Asn ", "AAC": "Asn ", "AAA": "Lys ", "AAG": "Lys ",
      "AGU": "Ser ", "AGC": "Ser ", "AGA": "Arg ", "AGG": "Arg ",
      "GUU": "Val ", "GUC": "Val ", "GUA": "Val ", "GUG": "Val ",
      "GCU": "Ala ", "GCC": "Ala ", "GCA": "Ala ", "GCG": "Ala ",
      "GAU": "Asp ", "GAC": "Asp ", "GAA": "Glu ", "GAG": "Glu ",
      "GGU": "Gly ", "GGC": "Gly ", "GGA": "Gly ", "GGG": "Gly "
    }; 
  }
  let proteins = []; 
  for (let f = 1; f <= frames; f++) {
    let protein = "";
    for (let i = f - 1; i < seq.length; i += 3) {
      if (i + 2 < seq.length) {
        let codon = seq.substring(i, i + 3)
        protein += aa[codon];
        if (i + 2 === seq.length - 1 ) {
          proteins.push(protein); 
        } 
      }
      else {
        proteins.push(protein); 
        i = seq.length; 
      }
    }
  }
  return proteins; 
}

let html = ` <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DNA Wizard</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap" rel="stylesheet">
  </head>
  <body>
    <header>
      <h1>DNA Wizard</h1>
      <h2>DNA Features Extraction Tool</h2>
    </header>
    <div id = "box2">
      <span class = "bolder">Using the DNA Features Extraction Tool</span>
      <ol>
        <li> 
          <span class = "bolder">Upload Sequence:</span> 
          Click on "Choose File" to select and upload a DNA FASTA file from your computer
        </li>
        <li>
          <span class = "bolder">Select Features: </span>
          Choose the features you would like to extract from the uploaded sequence(s)</li>
        <li>
          <span class = "bolder">Extract Features: </span>
          After selecting features, click on "Upload and Extract" to initiate the analysis process</li>
        <li> 
          <span class = "bolder"> View Results: </span>
          Once the analysis is complete, the extracted features will be displayed below</li>
      </ol>
    </div>
    <div id = "box3">
      <form id='form'>
        <div id = "uploadBox"> 
          <div class="input-group">
              <input id='file' type="file">
              <label for="file" class="custom-file-upload">Choose File</label>
          </div>
          <div id = "upload-text" class = "bolder">
            No file selected
          </div>
        </div>
          <div class="input-group">
            <label for='len'>
              <input id="len" name="len" value="len" class="opt" type="checkbox">
              Length
            </label>
            <label for='gcratio'>
              <input id="gcratio" name="gcratio" value="gcratio" class="opt" type="checkbox">
              GC Ratio
            </label>
            <label for='nfreq'>
              <input id="nfreq" name="nfreq" value="nfreq" class="opt" type="checkbox">
              Nucleotide Frequency
            </label>
            <br>
            <label for='compl'>
              <input id="compl" name="compl" value="compl" class="opt" type="checkbox">
              Complement
            </label>
            <label for='rev'>
              <input id="rev" name="rev" value="rev" class="opt" type="checkbox">
              Reverse
            </label>
            <label for='revcompl'>
              <input id="revcompl" name="revcompl" class="opt" value="revcompl" type="checkbox">
              Reverse Complement
            </label>
            <br>
            <label for='prot'>
              <input id="prot" name="prot" value="prot" class="opt" type="checkbox">
              Amino Acid Sequence(s)
            </label>
            <div class="hidden-input input-group">
              <label for="1f">
                <input class="frames" name="frames" value=1  type="radio">
                1 Frame
              </label>
              <label for="3f">
                <input class="frames" name="frames" value=3  type="radio">
                3 Frames
              </label>
              <label for="6f">
                <input class="frames" name="frames" value=6  type="radio" checked>
                6 Frames
              </label>
            </div>
            <div class ="hidden-input input-group">
              <label for="style">
                <input class="style" name="styles" value="c"  type="radio" checked>
                Compact 
              </label>
              <label for="style">
                <input class="style" name="styles" value="v"  type="radio">
                Verbose
              </label>
              <br>
            </div>
            <label for='all'>
              <input id="all" name="all" value="all" type="checkbox" id="all">
              Select All
            </label>
        </div>
          <button class="submit-btn" type='submit'>Upload and Extract</button>
      </form>
    </div>
    <div id = "box4">
    </div>
    <div id = "box5">
      <button class = "hidden-input">
        <a href="#">Back to Top</a><br>
      </button>
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src='./script.js'></script>
  </body>
  </html>
  `