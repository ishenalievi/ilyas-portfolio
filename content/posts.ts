// The content wall. Newest or best first. To add a post: save its image
// into /public/images/posts and add one line below.

export type Post = {
  title: string;
  note: string;
  href: string;
  img: string;
  w: number;
  h: number;
  platform: "ig" | "yt";
  type: "video" | "design";
  stamp: string;
};

export const posts: Post[] = [
  { title: "After Hours", note: "IMPRINT Reels, ep. 1, on @ubcimprint", href: "https://www.instagram.com/p/DeK9--tBvPo/", img: "/images/posts/imprint.jpg", w: 562, h: 1000, platform: "ig", type: "video", stamp: "IG reel" },
  { title: "Alternate Realities", note: "After a scene from Everything Everywhere All at Once", href: "https://www.instagram.com/reel/CtOA6naPweE/", img: "/images/posts/altreal.jpg", w: 562, h: 1000, platform: "ig", type: "video", stamp: "IG reel" },
  { title: "Red Moon in Venus", note: "Kali Uchis album poster", href: "https://www.instagram.com/p/Cq4RFnLPb1U/", img: "/images/posts/kali.jpg", w: 801, h: 1000, platform: "ig", type: "design", stamp: "IG" },
  { title: "Fake It Flowers", note: "beabadoobee poster, a new style", href: "https://www.instagram.com/p/Cq1sR0Jhk7A/", img: "/images/posts/beab1.jpg", w: 1000, h: 1000, platform: "ig", type: "design", stamp: "IG" },
  { title: "Baseball Sendoff", note: "BTV · IASAS 2024", href: "https://www.youtube.com/watch?v=cocrM2CmRTM", img: "/images/btv/cocrM2CmRTM.jpg", w: 1280, h: 720, platform: "yt", type: "video", stamp: "YouTube" },
  { title: "Commission", note: "Poster for @mateojjimz", href: "https://www.instagram.com/p/Cq6hSCivL5I/", img: "/images/posts/mateo.jpg", w: 800, h: 1000, platform: "ig", type: "design", stamp: "IG" },
  { title: "Keep scrolling", note: "“Continually scrolling until something stops you.”", href: "https://www.instagram.com/reel/CsLS_krrYdI/", img: "/images/posts/scroll.jpg", w: 562, h: 1000, platform: "ig", type: "video", stamp: "IG reel" },
  { title: "Hot Ones, Ep. 1", note: "BTV · IASAS", href: "https://www.youtube.com/watch?v=3TAkjXcQMv0", img: "/images/btv/3TAkjXcQMv0.jpg", w: 1280, h: 720, platform: "yt", type: "video", stamp: "YouTube" },
  { title: "Neo-tribalism", note: "Photoshop study", href: "https://www.instagram.com/p/CrasHEPPJoK/", img: "/images/posts/tribal.jpg", w: 1000, h: 666, platform: "ig", type: "design", stamp: "IG" },
  { title: "Perspective", note: "Graphic design piece", href: "https://www.instagram.com/p/CrvBwCkvtgG/", img: "/images/posts/persp.jpg", w: 1000, h: 1000, platform: "ig", type: "design", stamp: "IG" },
  { title: "Volleyball Sendoff", note: "BTV · 2023", href: "https://www.youtube.com/watch?v=rQMtM5s5GJc", img: "/images/btv/rQMtM5s5GJc.jpg", w: 1280, h: 720, platform: "yt", type: "video", stamp: "YouTube" },
  { title: "Hot Ones, Ep. 2", note: "BTV · IASAS", href: "https://www.youtube.com/watch?v=nBnC-iMoNgE", img: "/images/btv/nBnC-iMoNgE.jpg", w: 1280, h: 720, platform: "yt", type: "video", stamp: "YouTube" },
];
