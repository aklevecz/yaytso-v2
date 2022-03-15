var crypto = require("crypto");
var name = "0x15fe312c5ef2d6c1c7cf979bf9e47196e3463d29e7e175ffe9fc3a3913b0b6fe";
var hash = crypto.createHash("md5").update(name).digest("hex");
console.log(hash); // 9b74c9897bac770ffc029102a200c5de
