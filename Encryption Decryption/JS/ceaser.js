// import { encryptCeaser, decryptCeaser } from "./ceasercipher";

const dropArea = document.getElementById("drop-area");
const fileContentDisplay = document.getElementById("file-content");
const copyButton = document.getElementById("copyButton");
const saveButton = document.getElementById("saveButton");
const textContent = document.getElementById("drop-area");
const startGuide = document.getElementById("start-guide");
const ceaserEncrypt = document.querySelector(".ceaser-encrypt");
const ceaserDecrypt = document.querySelector(".ceaser-decrypt");

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

let ceaserChoose = undefined;

ceaserEncrypt.addEventListener("click", function () {
  textContent.textContent = "Encryption: Drag and drop a .txt file here";
  textContent.style.display = "flex";
  startGuide.style.display = "none";
  ceaserChoose = 1;
});

ceaserDecrypt.addEventListener("click", function () {
  textContent.textContent = "Decryption: Drag and drop a .txt file here";
  ceaserChoose = 0;
  textContent.style.display = "flex";
  startGuide.style.display = "none";
});

const caesarCipher = (text, shift) => {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const newChar = String.fromCharCode(char.charCodeAt(0) + shift);
    result += newChar;
  }

  return result;
};

const encryptCeaser = (text, shift) => {
  showAlert("success", "Encryption Successful");
  return caesarCipher(text, shift);
};

const decryptCeaser = (text, shift) => {
  showAlert("success", "Decryption Successful");
  return caesarCipher(text, -shift);
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
        const encrypted = ceaserChoose
          ? encryptCeaser(x, 1)
          : decryptCeaser(x, 1);
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
