/*
Essa função lida com o horario recebido diretamente dos parametros da URL
Ele recebe uma string, por exemplo: 03:30. Como uma string é um array de caracteres essa função separa
as horas (03) dos minutos (30) apenas usando um .split() no ":" e salva essas informações nas variáveis,
converte as horas em minutos: (hora * 60) + minutos e retorna esse valor.

Ex:
03:30
hora: 03; minuto: 30
(hora * 60) + minuto
(03 * 60) + 30 -> 180 + 30 = 210 minutos
*/


export default function convertHourToMinute(time: string){
    const [hour, minutes] = time.split(':').map(Number);
    const timeInMinutes = (hour * 60) + minutes;
    return timeInMinutes;
}