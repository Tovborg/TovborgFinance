import LogoIcon from "./LogoIcon"
export default function HeroSection() {
    return (
        <section className="lg:grid min-h-screen lg:place-content-center bg-gray-900">
            <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-10">
                <div className="mx-auto max-w-prose text-center">
                    <LogoIcon className="mx-auto h-14 w-auto text-indigo-600" />
                    <h1 className="text-4xl font-bold sm:text-5 text-white">
                        Understand your finances and
                        <strong className="text-indigo-600"> lower your </strong>
                        stress
                    </h1>

                    <p className="mt-4 text-base text-pretty sm:text-lg/relaxed text-gray-200">
                        Money management is a crucial skill that can help you achieve your financial goals and
                        live a stress-free life.
                    </p>

                    <div className="mt-4 flex justify-center gap-4 sm:mt-6">
                        <a
                            className="inline-block rounded border border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                            href="#"
                        >
                            Get Started
                        </a>

                        <a
                            className="inline-block rounded border px-5 py-3 font-medium shadow-sm transition-colors border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
                            href="#"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}