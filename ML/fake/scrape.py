

def scrape_clean_article(url):
    import requests
    from bs4 import BeautifulSoup

    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    # 🔥 Try to target main content (important)
    article = soup.find("article") or soup.find("main")

    if not article:
        article = soup  # fallback

    paragraphs = article.find_all("p")

    clean_paragraphs = []
    for p in paragraphs:
        text = p.get_text().strip()

        # filter garbage
        if len(text) > 80:
            clean_paragraphs.append(text)

    return clean_paragraphs

def is_valid_text(text):
    junk_phrases = [
        "log in", "sign up", "privacy policy",
        "terms", "cookie", "all rights reserved",
        "your browser is outdated",
        "interactive tools",
        "find answers to common questions",
        "disclaimer",
        "copyright notice"
    ]

    text_lower = text.lower()

    if any(j in text_lower for j in junk_phrases):
        return False

    if len(text) < 80:
        return False

    return True
if __name__ == "__main__":
    url = input("Enter website URL: ")
    content = scrape_clean_article(url)

    if content:
        clean_paragraphs = [p for p in content if is_valid_text(p)]

        with open("scraped_data.txt", "a", encoding="utf-8") as f:
            f.write(f"\n--- SOURCE: {url} ---\n\n")
            f.write("\n\n".join(clean_paragraphs) + "\n\n")

        print("✅ Clean data saved to scraped_data.txt")