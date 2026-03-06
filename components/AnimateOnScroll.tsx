"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

type Direction = "left" | "right" | "up" | "fade";

interface AnimateOnScrollProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  stagger?: boolean;
}

const getInitial = (direction: Direction) => {
  switch (direction) {
    case "left":
      return { opacity: 0, x: -30 };
    case "right":
      return { opacity: 0, x: 30 };
    case "up":
      return { opacity: 0, y: 30 };
    case "fade":
      return { opacity: 0 };
  }
};

const getAnimate = (direction: Direction) => {
  switch (direction) {
    case "left":
    case "right":
      return { opacity: 1, x: 0 };
    case "up":
      return { opacity: 1, y: 0 };
    case "fade":
      return { opacity: 1 };
  }
};

export default function AnimateOnScroll({
  children,
  direction = "up",
  delay = 0,
  className,
  style,
  stagger = false,
}: AnimateOnScrollProps) {
  if (stagger) {
    return (
      <motion.div
        className={className}
        style={style}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: delay,
            },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={getInitial(direction)}
      whileInView={getAnimate(direction)}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const staggerItemX = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};
