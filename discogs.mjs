function pathJoin(parts, sep) {
  const separator = sep || "/";
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp("^" + separator), "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp(separator + "$"), "");
    }
    return part;
  });
  return parts.join(separator);
}

class Discogs {
  discogsURL = "https://api.discogs.com";
  discogsToken = "IsEjXAuZGuQIEXRRTZeEIvIzbwcDGHpKspDoGMcO";

  async getArtistReleases(id) {
    const url = new URL(pathJoin([this.discogsURL, "artists", id, "releases"]));
    return await this.#fetchDC(url);
  }

  async getArtist(id) {
    const url = new URL(pathJoin([this.discogsURL, "artists", id]));
    return await this.#fetchDC(url);
  }

  async searchForArtists(name, page) {
    return await this.#search({ q: name, type: "artist" }, page);
  }

  async #search(args, page = 1) {
    const url = new URL(pathJoin([this.discogsURL, "database", "search"]));
    url.search = new URLSearchParams({
      page: page,
      ...args,
    });
    return await this.#fetchDC(url);
  }

  async #fetchDC(url) {
    const request = new Request(url, {
      headers: new Headers({
        Authorization: `Discogs token=${this.discogsToken}`,
      }),
    });
    const res = await fetch(request);
    return await res.json();
  }
}

export default Discogs;
