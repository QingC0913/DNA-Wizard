import fs from 'fs';
import fasta from 'biojs-io-fasta';
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
  console.log("body:", body);
  let fasta_file = req.file;
  let first = ""; 
  // console.log(fasta_file);
  fs.readFile(fasta_file.path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }  
    // Parse the FASTA content using biojs-io-fasta
    const sequences = fasta.parse(data);
    first = sequences[0].seq.toUpperCase(); 
    let len = null, gcat = [], gc = null, compl = null, rev = null,
        revcompl = null, prot = null; 
    if (body.len === "true") {
      len = length(first); 
      console.log("length: ", len); 
    }
    if (body.nfreq === "true") {
      gcat = freq(first);
      console.log("frequencies:", gcat); 
    }
    if (body.gcratio === "true") {
      console.log("in gcratio is true, what is gcat array?: ", gcat);
      if (gcat.length == 0) {
        gc = gc(first); 
        console.log("gc: ", gc);
      }
      else {
        gc = Math.round((gcat[1] + gcat[2]) / length(first)); 
        console.log("gc: ", gc);
      }
    }
    if (body.compl === "true") {
      compl = complement(first); 
      console.log("complement: ", compl);
    }
    if (body.rev === "true") {
      rev = reverse(first);
      console.log("reverse: ", rev); 
    }
    if (body.revcompl === "true") {
      revcompl = reverse(complement(first)); 
      console.log("rev complement", revcompl);
    }
    if (body.prot === "true") {
      console.log("proteins... in progress ");
      prot = "protein seq in progress"
    }
    let returnObj = {
      len: len, 
      gc: gc, 
      gcat: gcat, 
      compl: compl, 
      rev: rev, 
      revcompl: revcompl, 
      prot: prot
    }
    // console.log("returnObj: ", JSON.stringify(returnObj)); 
    res.status(200).json(returnObj);
  })  
} 
app.listen(5000, () => {
    console.log(`Server started...`);
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
  console.log("g+c is: ", g + c);
  return [a, c, g, t];
}

function gc(seq) {
  let len = seq.length; 
  let count = 0;  
  for (let i = 0; i < len; i++) {
    let ch = seq[i]; 
    if (ch == 'C' || ch == 'G') 
      count += 1; 
  }
  console.log(count);
  return (count / len); 
}

      // Access individual sequences
      // sequences.forEach(sequence => {
      //   console.log(`Header: ${sequence.id}`);
      //   console.log(`Sequence: ${sequence.seq}`);
      // });

