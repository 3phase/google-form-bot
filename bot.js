"use strict";

import puppeteer from "puppeteer";

const formLink =
    "https://docs.google.com/forms/d/e/1FAIpQLScihtU777RhqsmyicqQavarHyocYFfJX19q-Dw9pzlIYanGBA/viewform";

/**
 * input - short answer questions
 * mcq - multi-choice questions
 * checkbox - checkbox question
 * dpd - dropdown questions
 */
const formSchema = [
    'input',
    'mcq',
    'mcq',
    'checkbox'
];

// Multiple form submission using a loop
// for (let i = 0;i<5;i++){
//     fill(formLink,true);
// }

fill(formLink, true);

async function fill(formLink, submitForm) {
    let dropdownAnswer = "Choice 1";

    let browser;

    try {
        browser = await puppeteer.launch({
            headless: false,
            //headless option runs the browser in the command line
            //use false option to launch browser with graphic interface
            args: ["--no-sandbox"],
            // slowMo: 100
        });

        const page = await browser.newPage();
        console.log("Opening form");

        // Opening Form
        await page.goto(formLink, { waitUntil: "networkidle2" });
        const title = await page.$eval("title", (el) => el.textContent);
        console.log("form opened");
        console.log("Form Title: " + title);

        // To answer questions, first identify selectors of all similar questions type
        // then use the selector index to select the question
        // then perform an action to answer the question,
        // e.g. click or type an answer

        // Short Answer questions
        const selectors = await page.$$(
            "div[jsmodel]"
        );

        if (selectors.length !== formSchema.length) {
            console.warn("schema is not complete and might result in non proper results");
        }

        for (let [idx, selector] of selectors.entries()) await answerQuestion(selector, idx);

        await wait();

        // Form Submission
        if (submitForm) {
            await page.waitForTimeout(500);
            await page.click(".appsMaterialWizButtonPaperbuttonFocusOverlay");
            await page.waitForNavigation();
            const submissionPage = await page.url();
            console.log(submissionPage);
            if (submissionPage.includes("formResponse")) {
                console.log("Form Submitted Successfully");
            }
        }

        await page.close();
        await browser.close();

        function answerQuestion(selector, idx) {
            return new Promise(async (res) => {
                const questionType = formSchema[idx];
                switch (questionType) {
                    case "input":
                        await fillInput(selector);
                        break;
                    case "mcq":
                        await fillMcq(selector);
                        break;
                    case "checkbox":
                        await fillMcq(selector);
                        break;
                    case "dpd":
                        awaitfillDpd(selector);
                        break;
                };
                res();
            });
        }

        async function fillInput(selector) {
            return new Promise(async (res) => {
                const input = await selector.$$(`input`);
                if (!input.length) return;

                await clickAndScroll(input[0]);
                await wait();

                await page.keyboard.type("Answer to first short answer question", {
                    delay: 75
                });
                console.log("inserting answer to first short answer question");
                await wait();
                res();
            });
        }

        async function fillMcq(selector) {
            const fields = await selector.$$(`span[role='presentation'] label`);
            if (!fields.length) return;

            if (!!fields[0] && fields[0].toString() === "JSHandle@node") {
                await clickAndScroll(fields[0]);
                await wait();
            }
            // const selectors2 = await page.$$(".docssharedWizToggleLabeledLabelWrapper");
            // console.log("identifying selectors of all mcq and checkbox questions ");
            // await selectors2[1].click();
            // console.log("Answered first MCQ question");
            // await selectors2[3].click();
            // console.log("Answered second mcq question");
            // await selectors2[5].click();
            // console.log("ticked 1st checkbox");
            // await selectors2[6].click();
            // console.log("ticked 2nd checkbox");
            // await selectors2[7].click();
            // console.log("ticked 3rd checkbox");
            // await selectors2[8].click();
            // console.log("ticked 4th checkbox");
            // await page.click(".quantumWizMenuPaperselectContent");
        }

        async function fillDpd(selector) {
            // Dropdown menu questions
            // await page.waitForTimeout(400);
            // await page.click(
            //     '.exportSelectPopup.quantumWizMenuPaperselectPopup.appsMaterialWizMenuPaperselectPopup>.quantumWizMenuPaperselectOption.appsMaterialWizMenuPaperselectOption.freebirdThemedSelectOptionDarkerDisabled.exportOption[data-value="' +
            //     dropdownAnswer +
            //     '"]'
            // );
            // console.log("answered dropdown question");
        }


    } catch (error) {
        console.error(error.message);
    }
}

async function clickAndScroll(object) {
    return new Promise(async (res) => {
        try { await object.click() } catch (e) { }
        await wait();
        res();
    });
}

function wait() {
    return new Promise((res) => setTimeout(() => res(), 1000));
}