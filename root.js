const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Cliente está pronto!");

  rl.question("Digite o número sem o 9º digito: ", (number) => {
    rl.question("Digite a mensagem que deseja enviar: ", (message) => {
      rl.question("Quantas vezes deseja enviar a mensagem? ", (repeatTimes) => {
        const chatId = `5581${number}@c.us`;

        for (let i = 0; i < parseInt(repeatTimes); i++) {
          client
            .sendMessage(chatId, message)
            .then((response) => {
              console.log(`Mensagem ${i + 1} enviada com sucesso:`);
              response;
            })
            .catch((err) => {
              console.error(`Erro ao enviar mensagem ${i + 1}:`, err);
            });
        }

        rl.close();
      });
    });
  });
});

client.on("auth_failure", (msg) => {
  console.error("Falha na autenticação", msg);
});

client.on("disconnected", (reason) => {
  console.log("Cliente desconectado", reason);
});

client.initialize();
