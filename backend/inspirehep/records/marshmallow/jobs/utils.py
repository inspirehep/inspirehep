def get_reference_letters_without_email(data):
    reference_letters = data.get("reference_letters", {})
    if "emails" in reference_letters:
        del reference_letters["emails"]
    return reference_letters
