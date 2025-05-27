export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-700 to-blue-700 text-white px-4 py-8">
      <div className="rounded-md px-6 py-12 bg-gray-800 bg-opacity-25 flex flex-col gap-4 items-center justify-center max-w-lg">
        <h1 className="text-4xl font-bold flex flex-col items-center justify-center gap-0">
          <span className="font-outfit font-extrabold text-center mt-6 bg-gradient-to-br from-[#D10000] from-50% to-[#027DFF] to-65% bg-clip-text text-transparent">
            RED & BLUE.
          </span>
          <span className="text-xl">ABOUT THE PROJECT.</span>
        </h1>
        <span className="max-w-md text-center">
          <b>RED & BLUE</b> is a project built during our internship at{" "}
          <b>ASSIST SOFTWARE</b>, under our coordinator Marian Pinzariu.
        </span>

        <div className="flex flex-col items-start gap-2">
          <span>
            <h3 className="text-md text-lg bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Built by ⸻{" "}
              <span className="font-semibold">Team Hope It Works</span>
            </h3>
            <li>
              <a href="https://github.com/sauciucrazvan" target="_blank">
                Razvan Sauciuc
              </a>{" "}
              • Full-Stack Developer & Project Manager
            </li>
            <li>
              <a href="https://github.com/IacobRuben-Alexandru" target="_blank">
                Ruben Iacob
              </a>{" "}
              • Backend Developer
            </li>
            <li>
              <a href="https://github.com/adelinprelipcean">
                Adelin Prelipcean
              </a>{" "}
              • Frontend Developer
            </li>
            <li>
              <a href="https://github.com/Rbt-Ghost">Robert Cristian Nistor</a>{" "}
              • Frontend Developer
            </li>
          </span>

          <span>
            <h3 className="text-md bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Special Mentions
            </h3>
            <li>Marian Pinzariu • Project Coordinator</li>
            <li>
              <a href="http://vercel.com/">Vercel</a> • Hosting the Frontend
            </li>
            <li>Albert-Dorel Galan • Hosting the Backend</li>
          </span>

          <span>
            <h3 className="text-md bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Assets
            </h3>
            <li>
              <a href="https://pixabay.com/sound-effects/wrong-47985/">
                Error Sound
              </a>{" "}
              • Pixabay
            </li>
            <li>
              <a href="https://pixabay.com/sound-effects/pop-up-notify-smooth-modern-332448/">
                Round Sound
              </a>{" "}
              • Pixabay
            </li>
          </span>

          <h3 className="text-md font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Special thanks to ASSIST Software!
          </h3>
        </div>
      </div>
    </div>
  );
}
