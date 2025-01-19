import { Gaegu, Hi_Melody, Poor_Story, Dongle } from "next/font/google";

const gaegu = Gaegu({
    subsets: ['latin'],
    weight: '400',
});

const hiMelody = Hi_Melody({
    subsets: ['latin'],
    weight: '400',
});

const poorStory = Poor_Story({
    subsets: ['latin'],
    weight: '400',
});

const dongle = Dongle({
    subsets: ['latin'],
    weight: '400',
});

export const fonts = {
    gaegu: gaegu.className,
    hiMelody: hiMelody.className,
    poorStory: poorStory.className,
    dongle: dongle.className,
};

export { gaegu };