using System;
using System.Security.Cryptography;
using System.Text;

namespace Server
{
    public class Class
    {
        static void Main()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] secretKey = new byte[32]; // 32 bytes = 256 bits
                rng.GetBytes(secretKey);
                string base64Key = Convert.ToBase64String(secretKey);
                Console.WriteLine("New Secret Key: " + base64Key);
            }
        }
    }
}
