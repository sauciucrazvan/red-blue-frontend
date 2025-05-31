import { FaGithub, FaExternalLinkAlt, FaUsers, FaArrowLeft, FaStar, FaPalette } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      type: "spring",
      stiffness: 80,
      damping: 18,
    },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 80,
      damping: 18,
    },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 80,
      damping: 18,
    },
  },
};

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-700 to-blue-700 text-white px-2 py-8">
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center">

        {/* Project Description & Repo Links */}
        <motion.div
          className="bg-gray-900 bg-opacity-60 rounded-xl p-6 shadow-lg w-full flex flex-col gap-4 items-center"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <p className="text-center text-lg">
            <b>RED & BLUE</b> is a project built during our internship at <b>ASSIST SOFTWARE</b>, under the coordination of Marian Pinzariu.
          </p>
          <motion.div
            className="flex flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, type: "spring", stiffness: 80, damping: 14 }}
          >
            <a
              href="https://github.com/sauciucrazvan/red-blue-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800 hover:bg-blue-600 transition px-4 py-2 rounded-lg font-semibold"
              title="Frontend Repository"
            >
              <FaGithub className="text-xl" /> Frontend Repo <FaExternalLinkAlt className="text-xs" />
            </a>
            <a
              href="https://github.com/sauciucrazvan/red-blue-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800 hover:bg-red-600 transition px-4 py-2 rounded-lg font-semibold"
              title="Backend Repository"
            >
              <FaGithub className="text-xl" /> Backend Repo <FaExternalLinkAlt className="text-xs" />
            </a>
          </motion.div>
        </motion.div>

        {/* Team Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-gray-800 bg-opacity-70 rounded-lg p-5 flex flex-col gap-2 shadow"
            variants={slideLeft}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2 mb-2">
              <FaUsers className="text-yellow-300" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Team Hope It Works
              </h3>
            </div>
            <ul className="space-y-1">
              <li>
                <a href="https://github.com/sauciucrazvan" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                  Razvan Sauciuc
                </a>{" "}
                • Full-Stack Developer & Project Manager
              </li>
              <li>
                <a href="https://github.com/IacobRuben-Alexandru" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                  Ruben Iacob
                </a>{" "}
                • Backend Developer
              </li>
              <li>
                <a href="https://github.com/adelinprelipcean" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                  Adelin Prelipcean
                </a>{" "}
                • Frontend Developer
              </li>
              <li>
                <a href="https://github.com/Rbt-Ghost" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                  Robert Cristian Nistor
                </a>{" "}
                • Frontend Developer
              </li>
            </ul>
          </motion.div>

          {/* Special Mentions */}
          <motion.div
            className="bg-gray-800 bg-opacity-70 rounded-lg p-5 flex flex-col gap-2 shadow"
            variants={slideRight}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-yellow-300" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Special Mentions
              </h3>
            </div>
            <ul className="space-y-1">
              <li>Marian Pinzariu • Project Coordinator</li>
              <li>
                <a href="http://vercel.com/" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                  Vercel
                </a>{" "}
                • Hosting the Frontend
              </li>
              <li>Albert-Dorel Galan • Hosting the Backend</li>
            </ul>
          </motion.div>
        </div>

        {/* Assets Section */}
        <motion.div
          className="bg-gray-800 bg-opacity-70 rounded-lg p-5 flex flex-col gap-2 shadow w-full"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaPalette className="text-yellow-300" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Assets
            </h3>
          </div>
          <ul className="space-y-1">
            <li>
              <a href="https://pixabay.com/sound-effects/wrong-47985/" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                Error Sound
              </a>{" "}
              • Pixabay
            </li>
            <li>
              <a href="https://pixabay.com/sound-effects/pop-up-notify-smooth-modern-332448/" target="_blank" rel="noopener noreferrer" className=" hover:text-blue-300">
                Round Sound
              </a>{" "}
              • Pixabay
            </li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-4 text-center flex flex-col items-center gap-4"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <h3 className="text-md font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Special thanks to ASSIST Software!
          </h3>
          <motion.button
            className="flex items-center gap-2 bg-gray-800 bg-opacity-70 hover:bg-gray-700 transition px-4 py-2 rounded-lg font-semibold mt-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
          >
            <FaArrowLeft className="text-lg" />
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}