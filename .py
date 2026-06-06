import hashlib
import hmac

OTP_PEPPER = "5d238c8eb20ea19c17a25a5625330ba1dbd633e9eaef83e87cbf44656c93edca"
CODE_HASH = "c3179b2c7e74ab4d1864601bee97037863e04077b175d44146bfba8456e6b3f8"

def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_otp_code(code: str) -> str:
    # Matches: sha256(`${code}:${OTP_PEPPER}`)
    return sha256_hex(f"{code}:{OTP_PEPPER}")


def brute_force_otp() -> str | None:
    target = CODE_HASH.strip().lower()

    for i in range(1_000_000):
        code = f"{i:06d}"
        candidate = hash_otp_code(code)

        if hmac.compare_digest(candidate, target):
            return code

    return None


if __name__ == "__main__":
    result = brute_force_otp()

    if result is None:
        print("OTP not found.")
        print("Possible causes:")
        print("- sha256() in TypeScript does not return hex")
        print("- CODE_HASH has a prefix or different casing")
        print("- OTP_PEPPER has hidden whitespace/newline")
        print("- OTP was not 6 numeric digits")
        print("- hash was generated with a different pepper")
    else:
        print(f"OTP found: {result}")