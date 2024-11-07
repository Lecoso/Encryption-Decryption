// import { encrypthill, decryptCeaser } from "./ceasercipher";

const dropArea = document.getElementById("drop-area");
const fileContentDisplay = document.getElementById("file-content");
const copyButton = document.getElementById("copyButton");
const saveButton = document.getElementById("saveButton");
const textContent = document.getElementById("drop-area");
const startGuide = document.getElementById("start-guide");
const hillEncrypt = document.querySelector(".hill-encrypt");
const hillDecrypt = document.querySelector(".hill-decrypt");

// const filePathDisplay = document.getElementById("file-path");

const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 2000);
};

let hillChoose = undefined;

hillEncrypt.addEventListener("click", function () {
  textContent.textContent = "Encryption: Drag and drop a .txt file here";
  textContent.style.display = "flex";
  startGuide.style.display = "none";
  hillChoose = 1;
});

hillDecrypt.addEventListener("click", function () {
  textContent.textContent = "Decryption: Drag and drop a .txt file here";
  hillChoose = 0;
  textContent.style.display = "flex";
  startGuide.style.display = "none";
});

const DEFAULT_KEY = "GYBNQKURZ";

const mod = (a, m) => {
  return ((a % m) + m) % m;
};

const modInverse = (a, m) => {
  a = mod(a, m);
  for (let x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) return x;
  }
  throw new Error("Inverse does not exist.");
};

const determinant = (matrix) => {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let c = 0; c < n; c++) {
    det +=
      (c % 2 === 0 ? 1 : -1) * matrix[0][c] * determinant(minor(matrix, 0, c));
  }
  return det;
};

const minor = (matrix, row, col) => {
  return matrix
    .filter((_, r) => r !== row)
    .map((r) => r.filter((_, c) => c !== col));
};

const transpose = (matrix) => {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
};

const getMatrixInverse = (matrix) => {
  const det = mod(determinant(matrix), 26);
  if (det === 0) throw new Error("Matrix is singular; no inverse exists.");
  const invDet = modInverse(det, 26);

  const cofactors = [];
  for (let i = 0; i < matrix.length; i++) {
    cofactors[i] = [];
    for (let j = 0; j < matrix.length; j++) {
      const minorDet = determinant(minor(matrix, i, j));
      cofactors[i][j] = mod(((i + j) % 2 === 0 ? 1 : -1) * minorDet, 26);
    }
  }

  const adjugate = transpose(cofactors);
  return adjugate.map((row) => row.map((val) => mod(val * invDet, 26)));
};

const createMatrix = (key) => {
  if (typeof key !== "string") throw new TypeError("Key must be a string.");
  const size = Math.sqrt(key.length);
  if (!Number.isInteger(size))
    throw new Error("Key length must be a perfect square.");

  return Array.from({ length: size }, (_, i) =>
    Array.from(key.slice(i * size, (i + 1) * size), (c) => c.charCodeAt(0) - 97)
  );
};

const padText = (text, blockSize) => {
  const cleanText = text.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const padding = (blockSize - (cleanText.length % blockSize)) % blockSize;
  return cleanText + "x".repeat(padding);
};

const encrypt = (text, key = DEFAULT_KEY) => {
  const keyMatrix = createMatrix(key);
  const paddedText = padText(text, keyMatrix.length);
  const encrypted = [];

  for (let i = 0; i < paddedText.length; i += keyMatrix.length) {
    const block = Array.from(
      paddedText.slice(i, i + keyMatrix.length),
      (c) => c.charCodeAt(0) - 97
    );
    const encryptedBlock = keyMatrix.map((row) =>
      mod(
        row.reduce((sum, value, j) => sum + value * block[j], 0),
        26
      )
    );
    encrypted.push(...encryptedBlock.map((c) => String.fromCharCode(c + 97)));
  }

  let result = "";
  let textIndex = 0;
  for (const char of text) {
    if (char === " ") {
      result += " ";
    } else {
      result += encrypted[textIndex++];
    }
  }

  return result;
};

const decrypt = (text, key = DEFAULT_KEY) => {
  const keyMatrix = createMatrix(key);
  const inverseMatrix = getMatrixInverse(keyMatrix);

  const encryptedBlocks = text
    .replace(/ /g, "")
    .split("")
    .map((c) => c.charCodeAt(0) - 97);
  const decrypted = [];

  for (let i = 0; i < encryptedBlocks.length; i += keyMatrix.length) {
    const block = encryptedBlocks.slice(i, i + keyMatrix.length);
    const decryptedBlock = [];

    for (let j = 0; j < keyMatrix.length; j++) {
      let sum = 0;
      for (let k = 0; k < keyMatrix.length; k++) {
        sum += inverseMatrix[j][k] * block[k];
      }
      decryptedBlock.push(String.fromCharCode(mod(sum, 26) + 97));
    }
    decrypted.push(...decryptedBlock);
  }

  let decryptedText = "";
  let blockIndex = 0;

  for (const char of text) {
    if (char === " ") {
      decryptedText += " ";
    } else {
      decryptedText += decrypted[blockIndex++];
    }
  }

  return decryptedText;
};

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("hover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("hover");
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.classList.remove("hover");
  copyButton.classList.remove("hidden");
  saveButton.classList.remove("hidden");
  fileContentDisplay.classList.remove("hidden");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];

    if (file.type === "text/plain") {
      const reader = new FileReader();

      reader.onload = (event) => {
        const x = event.target.result;
        console.log(x);

        let encrypted = "";
        if (hillChoose === 1) {
          encrypted = encrypt(x, DEFAULT_KEY);
        }
        if (hillChoose === 0) {
          console.log("apple");
          encrypted = decrypt(x, DEFAULT_KEY);
        }
        fileContentDisplay.textContent = encrypted;
      };

      reader.readAsText(file);
    } else {
      fileContentDisplay.textContent = "Please drop a valid .txt file.";
      showAlert("error", "Please drop a valid .txt file");
    }
  }
});

document.getElementById("copyButton").addEventListener("click", () => {});

document.getElementById("copyButton").addEventListener("click", () => {
  const div = document.getElementById("file-content");
  const textToCopy = div.textContent;

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("Text copied to clipboard");
      showAlert("success", "Text Copied.");
    })
    .catch((err) => {
      console.error("Error copying text: ", err);
    });
});

document.getElementById("saveButton").addEventListener("click", () => {
  const div = document.getElementById("file-content");
  const textToSave = div.textContent;

  const blob = new Blob([textToSave], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${generateRandomString(5)}.txt`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  console.log("File saved as savedText.txt");
});
