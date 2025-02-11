import type { Request, Response } from "express";
import type Stripe from "stripe";
import { stripe } from "../lib/stripe";
import createHttpError from "http-errors";
import db from "../lib/prisma";
import { Plan } from "@prisma/client";
import asyncHandler from "../lib";
import { getUserAssociation } from "../lib/getUserIdAssociation";

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Buffer;
  console.log(body)
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  console.log(`sig => ${sig}, ${JSON.stringify(body)}`)
  event = stripe.webhooks.constructEvent(body, sig!, "whsec_yFIHINaJJDfAkNVfx6l5uF3IwT9Uz0Aw");
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = await stripe.checkout.sessions.retrieve(
          (event.data.object as Stripe.Checkout.Session).id,
          {
            expand: ["line_items",]
          }
        );
        const customerId = session.customer as string;
        const customerDetails = session.customer_details;

        if (customerDetails?.email) {
          const company = await db.user.findUnique({
            where: {
              email: customerDetails.email
            }
          });
          const user = await db.company.findUnique({
            where: {
              userId: company?.id
            }
          })
          if (!user) throw new Error("User not found!");
          if (!user.customerId) {
            await db.company.update({
              where: {
                id: user?.id
              },
              data: {
                customerId
              }
            })
          }

          const lineItems = session.line_items?.data || [];
          for (const item of lineItems) {
            const priceId = item.price?.id;
            const isSubscription = item.price?.type === "recurring";

            if (isSubscription) {
              let endDate = new Date();
              if (priceId === process.env.STRIPE_YEARLY_PRICE_ID!) {
                endDate.setFullYear(endDate.getFullYear() + 1);
              } else if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID!) {
                endDate.setMonth(endDate.getMonth() + 1);
              } else {
                throw createHttpError(400, "Invalid priceId");
              }
              await db.subscription.upsert({
                where: {
                  companyId: user.id,
                },
                create: {
                  companyId: user.id,
                  startDate: new Date(),
                  endDate: endDate,
                  plan: Plan.ENTERPRISE,
                  period: priceId === process.env.STRIPE_YEARLY_PRICE_ID ? "YEARLY" : "MONTHLY"
                },
                update: {
                  plan: Plan.ENTERPRISE,
                  startDate: new Date(),
                  endDate: endDate,
                  period: priceId === process.env.STRIPE_YEARLY_PRICE_ID ? "YEARLY" : "MONTHLY"
                }
              })
            } else {
              console.log("Else executed!");
            }
          }
        }
      break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event!`, error);
    throw createHttpError(400, 'Webhook Error!');
  }
  res.status(200).json({
    message: "Webhook Recevied!"
  })
})