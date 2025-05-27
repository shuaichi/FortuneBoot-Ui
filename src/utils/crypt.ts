import { JSEncrypt } from "jsencrypt";
import * as CryptoJS from "crypto-js";
import { isEmpty } from "@pureadmin/utils";
import { getRsaPublicKey } from "@/api/common/login";

// 加密
export async function rsaEncrypt(txt): Promise<string> {
  const encryptor = new JSEncrypt();
  // 密钥对生成 http://web.chacuo.net/netrsakeypair
  // RSA 公钥 对应的私钥放在后端项目的application-basic.yml文件下
  const res = await getRsaPublicKey();
  // 设置公钥
  encryptor.setPublicKey(res.data);
  // 对数据进行加密
  const encryptedValue = encryptor.encrypt(txt);

  // Check if the encrypted value is a boolean
  if (typeof encryptedValue === "boolean") {
    throw new Error("Encryption failed: Encrypted value returned a boolean");
  }

  return encryptedValue;
}

const aesKey = "fortuneboot12345";

export function aesEncrypt(txt): string {
  if (isEmpty(txt)) {
    return null;
  }
  const message = CryptoJS.enc.Utf8.parse(txt);
  const secretPassphrase = CryptoJS.enc.Utf8.parse(aesKey);
  const iv = CryptoJS.enc.Utf8.parse(aesKey);

  return CryptoJS.AES.encrypt(message, secretPassphrase, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv
  }).toString();
}

export function aesDecrypt(txtEncrypt): string {
  const secretPassphrase = CryptoJS.enc.Utf8.parse(aesKey);
  const iv = CryptoJS.enc.Utf8.parse(aesKey);
  return CryptoJS.AES.decrypt(txtEncrypt, secretPassphrase, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv
  }).toString(CryptoJS.enc.Utf8);
}
