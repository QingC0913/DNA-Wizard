import fs from 'fs';
import Fasta from 'biojs-io-fasta';
import express from 'express'; 
import multer from 'multer'; 
import cors from "cors"; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.post("/upload_file", upload.single("file"), uploadFiles);

function uploadFiles(req, res) {
  const body = req.body
  // console.log("body:", body);
  let fasta_file = req.file;
  fs.readFile(fasta_file.path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }  
    // Parse the FASTA content using biojs-io-fasta
    const sequences = Fasta.parse(data);
    let to_return = []; 
    console.log(sequences.length); 
    sequences.forEach(sequence => {
      console.log(sequence);
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
        const LABELS = ["5'3' Frame 1:", "5'3' Frame 2:", "5'3' Frame 3:", 
                      "3'5' Frame 1:", "3'5' Frame 2:", "3'5' Frame 3:"];
        let labs = LABELS.slice(0, body.protFrames);
        let values = []; 
        if (body.protFrames <= THREE) {
          values = aminoAcid(first, body.protFrames); 
        }
        else {
          let a = aminoAcid(first, THREE); 
          let b = aminoAcid(reverse(first), THREE);
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
        prot: prot
      }
      to_return.push(returnObj);
      console.log(to_return);
    });
    console.log(typeof to_return);
    // res.status(200).json(returnObj);
    res.status(200).json(to_return);
  })  
} 
app.listen(5000, () => {
    console.log(`✨🌟 Server started...🌟✨`);
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

function aminoAcid(seq, frames) {
  seq = seq.replace(/T/g, 'U');
  let aa = {
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
