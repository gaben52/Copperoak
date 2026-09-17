-- Import of Airtable "Properties" grid view export into public.properties.
-- Generated columns (auction_month, variance, profit) are computed automatically by Postgres
-- and must not be targeted by INSERT - they're derived from sale_date/winning_bid/max_bid/reno_cost.
-- 6 completely blank trailing rows from the Airtable export (no address, no real
-- data) were excluded - they looked like accidental empty rows, not real properties. If any of
-- those were meant to be real placeholder listings, say so and they can be added separately.

insert into public.properties (
  address, location, state, county, city, zip, sale_date, clear_title, mortgage_balance, open_bid, arv, arv_2nd, max_bid, reno_cost, auction_outcome, trustee_name, trustee_phone, trustee_email, notes, drive_report_notes, photos, status, winning_bid, property_status, expected_refund_amount, payment_method, reno_spent, contract_price, sale_price, holding_costs, acquired_date, listed_date, closed_date, beds, baths, sq_ft, year_built, buyer_side, occupancy, expected_closing_date, deed_recorded, title_report
) values
('1613 Forest Ave Unit 1', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37916', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REMOVED', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3297 Venson Drive', 'Auction.com', 'TN', 'Shelby', 'Bartlett', '38134', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cancelled DNB', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2364 South Strathmore Circle', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38112', '2026-09-03'::date, 'Do NOT Bid', NULL, 355000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('203 Brooke Castle Drive', 'Auction.com', 'TN', 'Davidson', 'Hermitage', '37076', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cancelled DNB', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2396 Gardenbrook Drive', 'Auction.com', 'TN', 'Shelby', 'Bartlett', '38134', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3173 Gwynnwood Drive', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37207', '2026-09-03'::date, 'Clear (1st Lien)', 1, 84972, 185000, 175000, 95000, 35000, NULL, NULL, NULL, NULL, '**REVIEW TITLE NOTES quick double check needed**

COMP at 189k pending sale

Confirmed Auction.com bit on 9/3', 'Cross referenced Title report and public notice via chat, foreclosure is confirmed on 1st position.

POSSIBLE ISSUE: Tennessee Housing Development Agency - 40k second lien

PER CHAT:
Title report confirms the 2007 NovaStar/Deutsche Bank mortgage ($98,100 original) is in 1st position and is the loan being foreclosed. The older 2003 mortgage was released.

There is a $40,000 THDA mortgage recorded in 2014 in 2nd position. It is junior to the foreclosing loan. However, THDA is not specifically named in the current foreclosure notice, so there is some potential post-sale title/curative risk. Based on TN law, this does not appear to convert THDA into a surviving senior lien or make this a 2nd-position foreclosure.

Conclusion: First-position foreclosure confirmed. No senior mortgage found ahead of Deutsche Bank. Treat THDA as a junior lien, but flag for possible title cleanup after auction.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('174 Delvin Dr', 'Auction.com', 'TN', 'Davidson', 'Antioch', '37013', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'TOO FUNKY', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3530 Faxon Ave', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38122', '2026-09-03'::date, 'Do NOT Bid', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('430 Lakewood Dr', 'Auction.com', 'TN', 'Fayette', 'Oakland', '38060', '2026-08-31'::date, 'Clear (1st Lien)', NULL, 229200, 275000, NULL, 180000, 10000, NULL, NULL, NULL, NULL, 'DNB Listed for 299k On MLS
(Gabe already listed ARV)

Erik: *cannot find public notice info for title.
Last Sale $330k in 05/2022
Loan balance $232,753 per prop radar

Cannot find public Notice GN
DNB', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('682 Beth Drive', 'Auction.com', 'TN', 'Montgomery', 'Clarksville', '37042', '2026-09-02'::date, 'Do NOT Bid', 1, 35752, 225000, 225000, 142000, 15000, 'Cancelled', NULL, NULL, NULL, 'Title looks good but order to confirm, agree with COMPS GABE . Erik:
Last sale: $79,500 - 5/27/1997
Est Loan Bal: $46,269 per Prop Radar

No additional liens that I can see, refi in 2017 for $58,400. James became sole owner (spouse removed) 2026.

Comp- 683 Beth Dr, Clarksville, TN 37042 - Right across the street, sold for $250k 4/2026 , does have a garage , subject does not.

non conservative - $235k

Title: Names match , deed of trust dates match TN notice and PR. No additional liens shown.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('5166 Circle Road', 'Auction.com', 'TN', 'Knox', 'Corryton', '37721', '2026-09-03'::date, 'Do NOT Bid', 1, 1, 325000, NULL, 210000, 10000, 'Cancelled', NULL, NULL, NULL, 'looks nice, has a detacted garage in back, 300k ARV maybe 350k. going conservative', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('752 Flint Ridge Drive', 'Auction.com', 'TN', 'Davidson', 'Whites Creek', '37189', '2026-09-03'::date, 'Do NOT Bid', 1, 1, 1, NULL, 1, 1, NULL, NULL, NULL, NULL, 'NEED COMPS, title is strange, check title. And the notice explicitly says the buyer takes subject to:
âany and all prior deeds of trust, liens... that may take priority over the Deed of Trust upon which this foreclosure sale is conductedâ
GABE', 'pushed to October', '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('9808 Shut In Gap Road', 'Auction.com', 'TN', 'Bledsoe', 'Spring City', '37381', '2026-09-03'::date, 'Clear (1st Lien)', 1, 1, 80000, NULL, 30000, 10000, NULL, NULL, NULL, NULL, '** NEED TITLE
Auction.com confirmed bid on 9/03 .
looks like 1st lien position BID', 'NEED TITLE', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('219 A Prince Ave', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37207', '2026-09-03'::date, 'Do NOT Bid', NULL, 270000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3416 Spring Water Cove', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38128', '2026-09-03'::date, 'Do NOT Bid', NULL, 41000, 75000, 1, 30000, 1, NULL, NULL, NULL, NULL, 'HOT', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('234 Hickory Drive', 'Auction.com', 'TN', 'Cheatham', 'Kingston Springs', '37082', '2026-09-03'::date, 'Clear (1st Lien)', 1, 1, 350000, 400000, 225000, 10000, NULL, NULL, NULL, NULL, 'PENDING SALE on market ; Gabe - REVIEW*

HOT

Erik:
3 Beds 2 Baths 1,175 sqft (Zillow shows 1,575sqft) / 1986 yr / 1.1 acre
Last Sale: $118,900 on 10/22/2001 per RPR quitclaim deed in 2018 to relative where it shows $210,000 conventional loan on 11/15/2021
Est loan bal: $247,003 per Prop Radar

Title: Deed of trust date and name matches 2021 transaction.  Prop radar reflects cash out loan nov 2021  but then a heloc of $58,700 which is in 2nd position 2023 date. no additional liens other than these.


title refers to heirs , possibility that owner is deceased. also reflects as listed on Zillow and under contract.

Comp- 319 Harpeth View Trl, Kingston Springs, TN 37082 - $470,000 4/16/2026 - this one looks multi level unlike subject.
Comp- 215 E Kingston Springs Rd, Kingston Springs, TN 37082- $400,000 on 1/22/2026 - also multi level.
Comp- 217 Harpeth View Trl, Kingston Springs, TN 37082- $265,000 on 7/31/2026 -  home was not sold on MLS.

RPR has a value of $458k .

non conservative 430k

Conservative - 350k', 'Auction.com confirmed will be auctioned on 9/2

Cross referenced title via chat with public notice. CONFIRMED that foreclosure loan is 1st position. good to clear title.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3412 Stormello Lane', 'Auction.com', 'TN', 'Rutherford', 'Murfreesboro', '37128', '2026-09-01'::date, 'Clear (1st Lien)', 351754, 1, 280000, 275000, 180000, 15000, 'Unknown', NULL, NULL, NULL, 'Erik:
Last sold: $313k  12/2021 - home is a 2017 build
Est Loan Balance: $343,434 per prop radar (cash out refi was done 22'')
Mechanics lein per prop radar as well $8,320 08/2025

Lots of comps close by, subject is slightly larger than most comps
Not conservative ARV $305-$310k
Conservative $280k

Title: 2 items 1st lien comes up as foreclosure in TN public notice , 2nd lien is from the HOA as noted above for 8k.', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('109 Lynhurst Dr', 'Auction.com', 'TN', 'Sumner', 'Hendersonville', '37075', '2026-09-03'::date, 'Do NOT Bid', 1, 1, 1, 1, 1, 1, 'Cancelled', NULL, NULL, NULL, 'CANT FIND CORRECT ADDRESS. PULL REPORT', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('214 Tyne Bay Dr', 'Auction.com', 'TN', 'Sumner', 'Hendersonville', '37075', '2026-09-03'::date, 'Clear (1st Lien)', 1, 164622, 300000, NULL, 190000, 15000, NULL, NULL, NULL, NULL, 'CHECK ARV not lots of comps

Auction.com bid confirmed to happen on 09/03 - opening bid raised up a little.', 'Cross referenced Title report and public notice via chat, Confirmed first position foreclosure!

Prop radar looks a bit messy, screenshotted that and tied that into the chat convo, confirmed that everything is good to clear.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('349 Chipman Rd', NULL, 'TN', 'Sumner', 'Bethpage', '37022', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'commercial DNB', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('122 Mountainwood Dr', 'Auction.com', 'TN', 'Sumner', 'Hendersonville', '37075', '2026-09-03'::date, 'Clear (1st Lien)', 1, 187300, 200000, NULL, 125000, 15000, NULL, NULL, NULL, NULL, 'Owner Deceased, Title looks clean, verify sales price with Title

Auction.com confirms 9/3 date.', 'Cross referenced title report with public notice in chat, first position foreclosure confirmed! prop radar matches.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('6918 Pemmbrooke Shire Lane', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37909', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REMOVED', NULL, '[]'::jsonb, 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('113 E Johnson Street', 'Auction.com', 'TN', 'Dyer', 'Newbern', '38059', '2026-09-02'::date, 'Do NOT Bid', 1, 97498, 140000, NULL, NULL, 70000, NULL, NULL, NULL, NULL, 'OB TOO HIGH, KILLED- GABE
Erik:
Unknown bed/bath 1946 sqft / 1959 yr / .28 acre roof looks rough
Last Sale: $61,300 11/8/16 per RPR
Est Loan Bal: $119,914 per Prop Radar does reflect a refi 5/1/23 for $124,870

Title: No additional liens reflecting on Prop Radar

Comp- 216 N Grayson St, Newbern, TN 38059- $172k 06/2026
Comp- 506 Main St E, Newbern, TN 38059 - $140k 07/2026
Comp - 302 Flora Cir, Newbern, TN 38059 - $223k 12/2025 - very similar style home.

Not conservative ARV assuming 3/2 or 4/2 - $200k

Conservative ARV - $140k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('6930 Rambling Brooks Ln', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37918', '2026-10-01'::date, 'Unknown', 1, 164090, 325000, NULL, 200000, 25000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1109 Blue Mill Road', NULL, 'TN', 'Cocke', 'Del Rio', '37727', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2763 Elston Brae Drive', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37849', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'removed', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('6906 Texas Valley Rd', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37938', '2026-09-03'::date, 'Do NOT Bid', NULL, 101520, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4811 York Hwy', 'Auction.com', 'TN', 'Jackson', 'Hilham', '38568', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, 150000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'TOO HIGH PURCHASED 2022
Erik:
2 bed 1 bath 1092 sqft / 1967yr / 2.09acre - rural area
Last sale: $220k 8/20/24 USDA per RPR
Est Loan Bal: $217,685 per Prop Radar

Title:Deed of trust dates and names match on TN pub notice and Prop radar
No additional liens .


Comps- 4863 York Hwy, Hilham, TN 38568 - $169k 03/2026 - 3/2 manufactured , not the best comp but its the property right next to this one.
Comp- 158 Boles Rd, Hilham, TN 38568- $175k 06/2026 3/1 800sqft , 2 car garage, similar looking home.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('438 Casey Lane', 'Auction.com', 'TN', 'Jefferson', 'Strawberry Plains', '37871', '2026-08-31'::date, 'Do NOT Bid', 100000, 1, 325000, 350000, 190000, 30000, NULL, NULL, NULL, NULL, 'REMOVED, CANCELLED

Erik:
Last Sale: $267k in 7/2002
Orig loan amount: $125k

Hard to find close by comps in this area.
closest / recent home sale is 2496 W Old Aj Hwy, Strawberry Plains, TN 37871
this one is a manufactured so hard to compare - sale price 350k 06/2026

Other comps in same city a little south west compare more to subject

Comp- 9422 Johnson Rd, Strawberry Plains, TN 37871 - 570k (flip) -03/2026
Comp- 174 Big Bend Rd, Strawberry Plains, TN 37871 - $475 12/2025 -on river
Comp - 2824 Vicksburg Ln, Strawberry Plains, TN 37871- $345 - 12/2025

Build year also much newer for subject compared to comps. comps are closest size .

ARV not conservative- $500k , as 2824 Vicksburg Ln, Strawberry Plains, TN 37871
sold for $562k in 1/2025 .

Conservative based on last close sale 325k.


**Title - looks to be clean w/ just the one mortgage, TN public notice does reflect possible estate / heir situation. unsure if that makes any difference.', NULL, '[]'::jsonb, 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4184 Chesapeake Way', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38125', '2026-09-03'::date, 'Clear (1st Lien)', 235554, 137250, 215000, NULL, 143000, 15000, NULL, NULL, NULL, NULL, 'OB just came out. BID

Auction still happening', 'Reviewed title , RPR and Prop radar , good to clear. foreclosure in 1st pos.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1075 Vanguard Drive', 'Auction.com', 'TN', 'Maury', 'Spring Hill', '37174', '2026-11-09'::date, 'Unknown', 1, 1, 460000, 450000, 320000, 5000, NULL, NULL, NULL, NULL, '*Auction moved to 11/9
Erik:
listed on MLS for $499,900, pretty clean , possibly just paint/small fixes

Last Sale: $329,869 06/2021
Unsure of Mortgage Balance - Prop radar shows paid in full
RPR reflects VA loan of $337,455 at time of sale.
HOA lien for $881

Comp - 1030 Vanguard Dr, Spring Hill, TN 37174 - $490k 04/2026
Comp -9008 Outpost Dr Spring Hill, TN 37174 - Under contract list price of $479k , this one is actually larger than subject by 200sqft

Hopefully ARV - $480k
Realistic/conservative - $460k

Title: Deed of trust dates line up TN public notice and Prop Radar. Prop radar shows HOA lien in first position, actual loan seems to be listed as first position per the public notice , but something to maybe look into.', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3815 Kipling Avenue', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38128', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'CANCELLED', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('9391 Green Knoll Drive', 'Auction.com', 'TN', 'Shelby', 'Germantown', '38138', '2026-09-03'::date, 'Clear (1st Lien)', 180000, 1, 575000, NULL, 350000, 40000, NULL, NULL, NULL, NULL, 'Review *ownership looks weird Prop Radar shows owners , RPR reflects two different owner

Erik:
BIG HOUSE
5 Beds 3.5 Baths 5,310 sqft per auction.com /1977 yr/ 1.9 acre

Last Sale: Quitclaim deed 11/2/2015 per Prop Rader , made owner Dawn Davis (this is who the foreclosure is for)

Est loan bal: $777,668 per prop radar DO NOT THINK THIS IS ACCURATE

Title: *Foreclosure name is not current owner. TN public notice deed of trust date is 4/9/2014.  Prop Radar does not reflect any transactions on that date. RPR does show conventional loan for $180,200 on 4/24/2014 for borrower Dawn Davis with Rate One as the lender. This lender appears as the original lender on the TN pub notice site.


COMPS are difficult , in the past year nothing the same age of subject property, other homes in the area with that size are newer construction selling for $650k - 1.6 mil

Comp: 3473 Crestwyn Dr, Germantown, TN 38138 -$250,000 on 9/16/2025 - 3/3 3951 sqft , smaller than subject, sale is low, was not on market.

Comp- 9329 Cielo Dr, Germantown, TN 38138 - $646,000 on 1/23/2026 5/5. 4,318sqft, much closer comp . subject on larger lot . 2012 build.', '1st lien 2014 loan 180k loan', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3024 Old New Cut Rd', NULL, 'TN', 'Robertson', 'Springfield', '37172', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('5174 Brushwood Drive', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38109', '2026-09-03'::date, 'Do NOT Bid', 83000, 1, 120000, NULL, 65000, 15000, 'Cancelled', NULL, NULL, NULL, 'Auction.com good to go 9/3', 'Auction.com good to go
Confirmed via RPR , Prop radar , title and pub notice that title is clear.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('626 Snowshoe Ln', 'Auction.com', 'TN', 'Montgomery', 'Clarksville', '37040', '2026-09-02'::date, 'Do NOT Bid', NULL, 213500, 265000, NULL, NULL, 10000, NULL, NULL, NULL, NULL, 'OB TOO HIGH GABE Erik:
3 bed 2 bath 1464 sqft / 2019yr / .46acre / 2 car garage
Last Sale: $300k 7/28/22 FHA per RPR
Est Loan Bal: $276,503 per Prop Radar

Title: Deed of trust date and names match on Prop radar and TN pub notice. TN public notice reflects a 2 additional liens , one Bank of America and capital one, this does not show on prop radar , maybe order title.

Comp-692 White Face Dr, Clarksville, TN 37040 direct comp - $297k 4/2026
Comp - 680 White Face Dr, Clarksville, TN 37040 similar also $305k 10/2025
Comp- 2238 Roanoke Rd, Clarksville, TN 37043 - little different style , less track home looking than comp. $280k 4/2026 also larger.

Non conservative 280k

Conservative- 265k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1156 Moreno Ln', 'Auction.com', 'TN', 'Marshall', 'Lewisburg', '37091', '2026-08-31'::date, 'Do NOT Bid', 115000, 115495, 215000, 245000, 135000, 15000, NULL, NULL, NULL, NULL, 'REMOVED good comps. one low comp at 180k. consistent at 250k. Lowered ARV to 215k to be safe. BID!', NULL, '[]'::jsonb, 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3155 Kimball Avenue', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38114', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, 85000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1 comp not many in the area', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('442 Flintlock Ct', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37217', '2026-09-03'::date, 'Clear (1st Lien)', 1, 149450, 225000, NULL, 155000, 10000, NULL, NULL, NULL, NULL, '** REVIEW TITLE NOTE - Chat gave green light in cross reference. TN law about HOA lien on condos to review. **

Auction.com bid set for 9/3 confirmed', 'Cross referenced Title with public notice via chat, confirmed first position foreclosure.

Chat pointed out HOA is a junior lien but could still be an issue.. chat note:

442 Flintlock Ct: Freedom''s 2022 $274,928 mortgage is confirmed 1st position. Rocky Montoya''s 2024 DOT and MHPS''s 2025 ~$7,462 lien are junior and specifically named in the foreclosure notice, so they should be extinguished by the first-lien sale.
Woodridge HOA has a $3,853.80 recorded lien; because this is a condo, TN law may preserve up to 6 months of regular assessments (~$1,150-$1,410) through the mortgage foreclosure. Recommend carrying ~$2K HOA/title reserve. No senior mortgage found.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1900 Hummingbird Ln', NULL, 'TN', 'Cocke', 'Newport', '37821', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
No longer on auction.com , Zillow does not show foreclosure.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1809 Susan Road', 'Auction.com', 'TN', 'Maury', 'Columbia', '38401', '2026-09-02'::date, 'Do NOT Bid', 1, 265300, 365000, NULL, 265000, 25000, NULL, NULL, NULL, NULL, 'DNB not high enough
265k OB 412K ESTIMATE VALUE AUCTION.COM

Erik:
Last Sale: $409k 03/2024 per RPR
Est Loan Balance: $390,924 per Prop radar - not addtl liens listed

Comp - 1809 Susan Road, Columbia, TN - $369k 06/2026
Comp- 1809 Susan Road, Columbia, TN - $379k 04/2026

Non conservative ARV- 380k

Title: deed of trust on TN notice matches that of prop radar. No additional liens listed in notice or on PR.', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('263 Sherry Cir', 'Auction.com', 'TN', 'Sumner', 'Gallatin', '37066', '2026-09-03'::date, 'Do NOT Bid', NULL, 298200, 375000, NULL, NULL, 75000, NULL, NULL, NULL, NULL, 'OB KILL. TOO HIGH GABE> REVIEW ** in title section, HUD 2 and 3 .

446k estimated ARV auction.com

Erik:
5 Beds 2 Baths 2,626 sqft per auction.com / 1972 yr / .4 acre

Last Sale: $420,000 on 3/23/2022 per RPR FHA
Est Loan Bal: $472,414 per Prop Radar

Title: Deed of trust date and name on TN pub notice match that of Prop Radar. There is a HUD lien in 2nd and 3rd position. RPR shows $100,271 investor/ non conforming loan in 3/10/2023 and prop radar shows this one being in second position. **Per chatgpt need to confirm that winning the bid releases all of the junior liens from HUD **

Comp- 201 W Hillcrest Dr, Gallatin, TN 37066 - $340,000 on 7/21/2026 - Clean property , smaller than subject, 3/2 1700 sqft.

Comp- 241 Hume Ave, Gallatin, TN 37066- $320,000 on 1/4/2026 - 4/3 2300 sqft , partial fixer.

Comp- 616 Hyde Park Ave, Gallatin, TN 37066- $329,000 on 8/21/2026 - 4/2 1582 sqft. again much smaller comp , about 1k less sqft.

Nothing in the past year compares to the subject property size wise.

Based on size ARV can be low $400''s non conservative.

Conservative: 375k

Zillow link for 2022 sale: https://www.zillow.com/homedetails/263-Sherry-Cir-S-Gallatin-TN-37066/444565534_zpid/

dated', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('947 Hedge Apple Dr', 'Auction.com', 'TN', 'Montgomery', 'Clarksville', '37040', '2026-09-02'::date, 'Do NOT Bid', 1, 161048, 275000, 275000, 165000, 20000, 'Cancelled', NULL, NULL, NULL, '*** AUCTION.com Shows Sold - checked on 9/2 at 338pm.
Looks like a 1st lien, eliminate Drive on search. Make sure the 14k second doesn''t stay. Run with title report. GABE

Erik:
Last Sale : $175k 09/2017
Estimated loan balance: $154,935 per prop radar
Prop radar does reflect cash out loan  of $14,830 05/2025

Comp - 859 Sugarcane Way Clarksville, TN 37040 *distressed property - $266k 04/2026 missing floors, other cosmetic issues as-is sale

Comp -1007 Sugarcane Way Clarksville, TN 37040 *pending sale- $245k could kill comps.

Multiple sales in the low 300s w/ similar comps.

Non conservative sale $295-$300k
Conservative fast sale - $275k

Title: Deed of trust dates match up on TN public note and Prop Radar.
There is a contract of sale dated 12/20/25 per prop radar, RPR shows it as well showing GGI HOME BUYERS LLC as a buyer for agreement of sale. Reviewing this would be junior to the actual loan so if the foreclosure happens then it would be removed. No way to see the actual agreement of sale doc.  something to consider on this one .', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('183 Steve Dr', 'Auction.com', 'TN', 'Dyer', 'Dyersburg', '38024', '2026-10-28'::date, 'Unknown', 1, 1, 185000, 175000, 85000, 40000, NULL, NULL, NULL, NULL, 'Erik:
unknown bed 1.5 bath 1220 sqft / 1973 build / .4 acre / a little rough
Last Sale: $89,900 8/6/18 conventional per RPR
Est Loan Bal: $77,325 per Prop Radar

Title: ** No info on TN public notice. No additional liens per Prop Radar

Comp- flip - 94 Steve Dr, Dyersburg, TN 38024- $205k 04/2026 - went under contract in less than a month.
Comp- 72 Palmer Subdivision Rd, Dyersburg, TN 38024- $207,500 04/2026
Comp - NOT A LISTING - 186 Palmer Subd Rd, Dyersburg, TN 38024 - $240k 11/2025


Non conservative- 200k
Consercative- 185k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2654 Fizer Rd', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38114', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REMOVED', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1380 Faxon Avenue', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38104', '2026-10-15'::date, 'Do NOT Bid', 1, 1, 275000, 1, 160000, 15000, 'Cancelled', NULL, NULL, NULL, '** Auction.com shows auction pushed to October 15 2026 *

NEED REAL ARV.. AGENT? Erik call an agent!
no real comps, nice place $100 per foot less repairs', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('295 Plus Park Blvd', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37217', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'commercial DNB', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('640 Bethel Rd', 'Auction.com', 'TN', 'Anderson', 'Clinton', '37716', '2026-08-31'::date, 'Clear (1st Lien)', 309993, 247000, 175000, 175000, 105000, 15000, NULL, NULL, NULL, NULL, 'Erik:
Last market sale - $305k VA 12/2023 then quitclaim deed where husband just listed as owner in 6/2025 for $313,555 VA (refi)

Estimated balance: $309,993

Comp- 663 Bethel Rd, Clinton, TN 37716 - $210k 5/2026', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2503 Harris Road', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37924', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('105 Adkins Street', 'Auction.com', 'TN', 'Montgomery', 'Clarksville', '37042', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, 150000, NULL, NULL, 20000, 'Cancelled', NULL, NULL, NULL, 'Erik: *Postponed auction to 10/14/26 per auction.com

2/1 1155 sqft
Last Sale: $43,600 9/17/19 conventional
Est loan bal: $39,359 per Prop Radar
Title: at time of sale a second loan of $5,500 , possible DPA

Comp - 103 Circle Hill Dr, Clarksville, TN 37042 - $165k 07/2026
Comp - 120 Circle Hill Dr, Clarksville, TN 37042 - $202k 07/2026

Non conservative 165-175k
Conservative - 150k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('221 Glenview Estate Road', 'Auction.com', 'TN', 'Marion', 'Jasper', '37347', '2026-08-31'::date, 'Do NOT Bid', 255688, NULL, 300000, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*Auction.com reflects 10/27/26 auction date.

Loan balance: $255,688 per prop radar

Last sale: $260k 11/2019

Comp- 1421 Hancock Rd, Jasper, TN 37347 - $475k 10/2025
Comp- 510 Knollwoods Rd, Jasper, TN 37347 - $325k 10/25', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('915 Atoka Idaville Rd', 'Auction.com', 'TN', 'Tipton', 'Atoka', '38004', '2026-09-03'::date, 'Do NOT Bid', 1, 111136, 165000, NULL, 112000, 20000, NULL, NULL, NULL, NULL, 'HOT', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('6921 Somerset Farms Cir', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37221', '2026-09-03'::date, 'Do NOT Bid', 1, 145000, 450000, NULL, 300000, 20000, 'Cancelled', NULL, NULL, NULL, 'pushed to October', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3258 Hwy 41 S', 'Auction.com', 'TN', 'Robertson', 'Springfield', '37172', '2026-09-02'::date, 'Do NOT Bid', 1, 1, 250000, 200000, 145000, 25000, 'Cancelled', NULL, NULL, NULL, 'ERIK- Look at this comp 3176 Highway 41 S,
Springfield, TN 37172, sold 325k, off the highway also. Increasing ARV 250k from 200k

Erik:
Zillow reflects 2 bed 1 bath / 1768 sqft / 1970 yr / .3 acre / detached garage
Last Sale: $132k 8/25/16 per RPR (says investor non conforming loan)
Est Loan Balance: $105,955 per prop radar

Title: Deed of trust dates and names match up on prop radar and TN pub notice. No additional liens per prop radar and TN pub notice.

Dont like that it''s right off of a highway.

Comp- flip - 3078 Old Greenbrier Pike, Greenbrier, TN 37073- $379k 03/2026 this one is further away from the hwy next road north, larger lot 3/2 1565sft

Comp - 2806 Driftwood Dr, Springfield, TN 37172 - $237k 04/2026 - closer to town.

Comp- 2860 Old Greenbrier Pike, Greenbrier, TN 37073 - $200k 05/2026 - further south, technically next town.  a lot smaller . under 800 sqft


comps kind of suck , if full renovation and ability to make it a 3br that may add more value, especially with the sqft of the home.

non conservative ARV - $225k (if keep 2br)  $250k if 3br

Conservative - $200k', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('127 Madison St', 'Auction.com', 'TN', 'Unicoi', 'Erwin', '37650', '2026-08-31'::date, 'Do NOT Bid', 179892, 155000, 150000, 100000, 80000, 15000, 'Unknown', NULL, NULL, NULL, 'OPEN BID Zillow 208k


Erik:
Last sale 12/2023 - 185k VA
128 Tyler St, Erwin, TN 37650 - comp - sold for 90k
116 Jefferson St, Erwin, TN 37650 - comp sold 122k', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('326 Pitt Lane', NULL, 'TN', 'Robertson', 'Springfield', '37172', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('228 Mineral St', 'Auction.com', 'TN', 'Cocke', 'Newport', '37821', '2026-09-02'::date, 'Do NOT Bid', NULL, 77220, 90000, NULL, NULL, 10000, NULL, NULL, NULL, NULL, 'OB TOO HIGH KILLING IT Erik:
Last Sale: $130k 1/12/2024
Est loan bal : $121,675 per Prop Radar
Liens: county/ city lien 06/15/2026 for $92.00 per prop radar

Tiny house 663 sqft

comp- 135 Highland St Newport Tn 37821 - pend $95k distressed property.
comp - 416 8th St, Newport, TN 37821 - $55k 05/2026

Weird area, a lot of recently sold distressed homes for under 80k. no real sold comps that were renovations

I dont like this one .

Non conservative- $120k

Title: Name and deed of trust sale dates match on TN notice and Prop Radar. Possible county lien of $92 , but TN notice does not reflect any additional liens.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4390 Scott Hollow Road', 'Auction.com', 'TN', 'Maury', 'Culleoka', '38451', '2026-09-02'::date, 'Do NOT Bid', 1, 1, 400000, 400000, 250000, 30000, 'Cancelled', NULL, NULL, NULL, 'Erik:
Bed unknown / 3.5 bath 1590 sqft / 1988yr / 2.65 acre
Last Sale: $135k 12/2/08
Est Loan Bal: $170,849 per Prop Radar

Title: Deed of trust name matches, Deed of trust date shows 2/4/24 but release and new loan shows 05/2024 in prop radar. No additional liens listed in prop radar or notice.

Comp- 4628 Dugger Rd, Culleoka, TN 38451 - $429k 05/2026 - this one had no garage, subject prop does.

Hard to find any additional close comps. I like this one. there''s a mix of older and new construction homes on large lots in the area.

2914 Valley Creek Rd, Culleoka, TN 38451 -$800k 95 build on 8 acre , brick home so hard to compare . but went under contract in a week.

2308 Quality St, Culleoka, TN 38451- 2024 yr  still similar style home same size ,only .34 acre $374k 07/2026


Non conservative- 425k
conservative- 400k', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4417 Saunders Ave', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37216', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REMOVED', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('8501 Burnham Ln  Unit 4', 'Auction.com', 'TN', 'Davidson', 'Antioch', '37013', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, '*No longer showing on auction.com

Erik:', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('8710 Finchwood Lane', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37924', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1906 Dessa Dr', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38127', '2026-09-03'::date, 'Clear (1st Lien)', 130099, 81270, 150000, NULL, 90000, 15000, NULL, NULL, NULL, NULL, 'Hot', 'Reviewed title thoroughly w/ Gabe on this one. under LLC name , deed of trust still there and in 1st position and being foreclosed on.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1449 David Swann Dr', NULL, 'TN', 'Jefferson', 'Dandridge', '37725', '2026-08-31'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
Property Radar shows new notice of trustee for auction date 10/6/2026
no longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2808 Wayland Rd', 'Auction.com', 'TN', 'Knox', 'Knoxville', '37914', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CANT COMP DNB 2024 buy', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('203 Wagoners Way', 'Auction.com', 'TN', 'Sumner', 'Westmoreland', '37186', '2026-09-03'::date, 'Clear (1st Lien)', 1, 195200, 325000, 325000, 215000, 15000, NULL, NULL, NULL, NULL, 'Good comps, go lower 325k with reno

Auction.com has bid for 9/3', 'Cross referenced Title with public notice via chat , First position foreclosure confirmed. good to clear!', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('500 S Center St', 'Auction.com', 'TN', 'Washington', 'Johnson City', '37604', '2026-09-04'::date, 'Clear (1st Lien)', NULL, 64132, 175000, NULL, NULL, 45000, NULL, NULL, NULL, NULL, 'Erik:
2 bed 2 bath 973 sqft / 1945 build / 7,500 sqft lot
Last Sale: $71,700 on 3/2/2017 per RPR
Est loan bal: Prop radar reflects $0 , Rubin Lublin LLC is shown as the lender under RPR foreclosure.

Title: Deed of trust name and dates match up TN public record and prop radar.
No additional liens listed .

Comp- 2605 Gray St, Johnson City, TN 37604- $205,000 on 6/29/2026 flip .

Comp- 405 S North St, Johnson City, TN 37604- $195,000 5/26/2026 flip

Comp - 301 Carter Sells Rd, Johnson City, TN 37604- $212,000 4/6/2026 clean property is on 1 acre vs .17 acre like subject.


Non conservative ARV - 190k

Conservative $175k

Zillow link with prev photos: https://www.zillow.com/homedetails/500-Center-St-Johnson-City-TN-37604/42572338_zpid/?', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('624 Clymersville Rd', 'Auction.com', 'TN', 'Roane', 'Rockwood', '37854', '2026-09-02'::date, 'Do NOT Bid', NULL, 145407, 165000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'OB TOO HIGH GN Erik:
3 bed 2 bath 1120 sqft / 2000 yr / .83 acre / Manufactured
Last Sale: $180k 10/2/22 per RPR
Est Loan Bal: $173,939 per Prop Radar

Title: *No TN public notice info* No additional liens per Prop Radar .

Comp- 414 S Chamberlain Ave, Rockwood, TN 37854 - $188,500 06/2026
Comp- 407 N Wilder Ave, Rockwood, TN 37854 - $175k 06/2026 small lot and dated inside .
Comp- 420 E Baldwin St, Rockwood, TN 37854 - $194k 02/2026

non conservative- 185k
Conservative -165k

Decent sales volume in this area.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('5048 Gull Rd', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38109', '2026-09-03'::date, 'Do NOT Bid', 1, 1, 125000, NULL, 70000, 15000, 'Cancelled', NULL, NULL, NULL, '** removed from auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('155 E. Rollins St.', 'Auction.com', 'TN', 'Greene', 'Greeneville', '37743', '2026-08-31'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1164 Linn Cove Court', 'Auction.com', 'TN', 'Sumner', 'Gallatin', '37066', '2026-09-03'::date, 'Clear (1st Lien)', 1, 1, 365000, 375000, 255000, 5000, NULL, NULL, NULL, NULL, 'HOT
Erik:
4 Beds 3 Baths 1,869 sqft / 2024 yr / .11 acre

Last Sale: $386,990 on 4/15/2024 per RPR
Est loan bal: $373,292 per Prop Radar

Title: Deed of trust date matches on TN pub notice and Prop radar, Owner names match as well. HOA lien in 2nd position for $2,226 per prop radar. Foreclosure on 1st lien.

Home is in a new construction community, will be competing with new builds, per chatgpt they are offering rate incentives at 4.99%

Comp- 2104 Mackinac Bnd, Gallatin, TN 37066 - $444,000 - 5/26/2026 - single story, subject is 2 story.

Comp - 1069 Linn Cove Ct, Gallatin, TN 37066 -$377,000 - 7/17/2026 single story.


Auction.com still happening on 9/2', 'TN public notice not pulling up.

Title is good to go, ran title report through chat, cross referenced the public notice via chat, foreclosure on 1st lien.', '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('884 New Lewisburg Hwy', NULL, 'TN', 'Maury', 'Columbia', '38401', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
* No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('117 Pleasant Hill Drive', NULL, 'TN', 'Robertson', 'Springfield', '37172', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1890 Goodhaven Dr.', 'Auction.com', 'TN', 'Shelby', 'Memphis', '38116', '2026-09-03'::date, 'Do NOT Bid', 1, 1, 150000, NULL, 65000, 40000, 'Cancelled', NULL, NULL, NULL, 'DNB 2005 loan. confirm title. Putting larger rehab. Gabe', 'Trustee sale postponed until November 12', '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4928 Valley Birch Dr.', 'Auction.com', 'TN', 'Shelby', 'Bartlett', '38002', '2026-11-23'::date, 'Do NOT Bid', 1, 1, 400000, NULL, 270000, 10000, 'Cancelled', NULL, NULL, NULL, '**Auction.com postponed to 11/23/26', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('280 Philpot Road', NULL, 'TN', 'Bedford', 'Shelbyville', '37160', '2026-08-31'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('350 Bailey Street', 'Auction.com', 'TN', 'Greene', 'Greeneville', '37745', '2026-08-31'::date, 'Clear (1st Lien)', 35573, 1, 165000, 175000, 90000, 25000, '3rd Party', NULL, NULL, NULL, 'SOLD AT 42k Erik:
Last sale was $48k 07/2017
Owner listed as Christopher Brown, seller Judith Brown, foreclosure name under Judith Brown, not sure why.

Loan balance: $35,573 per prop radar

Comp- 574 Bailey St, Greeneville, TN 37745 - $249k 08/2026
Comp- 1489 Baileyton Main St, Greeneville, TN 37745 - $214k 04/2026 (detached garage)

TITLE- 2012 NOS - RPR shows purchase in 2012. Matches for 1st lien BID -GN
*Title is weird. public notice reflects under Judith brown, not current owner, possible relation. Deed of trust date is 11/7/2012 , where last sale is 2017.
Public notice also references 2 parcel numbers. one comes up as the home, the other is land possibly connected that .58 acres.

Prop radar reflects Judith as the owner still on the 2017 warranty deed. I do not see anywhere that there was a release from the loan she took out . Just an update to the names on the deeds.', NULL, '[]'::jsonb, 'Bid Ready', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1326 Midway Rd.', 'Auction.com', 'TN', 'Greene', 'Midway', '37809', '2026-08-31'::date, 'Do NOT Bid', NULL, NULL, 155000, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik: * New auction date tues NOV 10 *
Manufactured home 2006 year
Loan balance: $0 per prop radar
Last sale $98k in 11/2009 apr reflects foreclosure sale for that same amount.

Comp- 140 Midway Cir, Midway, TN 37809 - 94 single wide - $179k 06/2026
Comp- 341 Wild Rye Ln, Midway, TN 37809 - 95 trailer - $175k 11/2025
Comp- 410 McDonald Rd, Midway, TN 37809 -2018 trailer - $210k 09/2025', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1229 Cheyenne Ct', 'Auction.com', 'TN', 'Davidson', 'Madison', '37115', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'removed', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3262 Dover Rd', NULL, 'TN', 'Montgomery', 'Woodlawn', '37191', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2Lien-708 Central Ave', 'Auction.com', 'TN', 'Montgomery', 'Clarksville', '37040', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2 LIEN PLEASE REVIEW

Erik:
RPR reflects DISTRICT WES HOLDINGS LLC purchased 7/10/26 quitclaim deed

passing this one for now.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('231 Austin Road', NULL, 'TN', 'Macon', 'Lafayette', '37083', '2026-08-31'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
Home shown as sold 7/28/26 , no longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('5133 Amalie Drive', 'Auction.com', 'TN', 'Davidson', 'Nashville', '37211', '2026-09-03'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REMVOED', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1220 Deneen Ln', NULL, 'TN', 'Hamblen', 'Morristown', '37814', '2026-09-02'::date, 'Do NOT Bid', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancelled', NULL, NULL, NULL, 'Erik:
*No longer on auction.com', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('128 Wild Dogwood Way', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29605', '2026-09-08'::date, 'Request Title', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '** REVIEW

Zillow reflects on market sale 8/14/2026 for $235,000

RPR reflects a buyer of KEMT PROPERTIES LLC', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('9-A Stadium Drive', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29609', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, '**Duplicate', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('9-A Stadium Drive', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29609', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:
3 bed 2 bath 1119 sqft / 1999 /  .52 acre

Last sale: 98,000 on 6/30/2006 per RPR

est loan bal: Prop Radar has $0 , purchase shows loan of $78,400 unknown loan type.

Title:Per prop radar doesn''t show any liens at all. No SC public notice info.

Comp- 7 Stadium Dr, Greenville, SC 29609- $339,500 on 6/5/2026 clean renovation. 3/3  1484 sqft , so bigger than subject.

Comp- 103 Stadium Dr, Greenville, SC 29609- $236,000 on 11/21/2025 3/2 1250 , under contract in days.  parts a little dated but clean


comp- 1101 Piedmont Park Rd, Taylors, SC 29687- $265,000 on 3/19/2026 good comp.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('304 Weddington Lane', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29681', '2026-09-08'::date, 'Request Title', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '*Review*

Erik:

No info on this property. Maps to reflect a single family home, RPR , Prop Radar and Zillow show it as just land.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('608 Rhett Street', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29601', '2026-09-08'::date, 'Request Title', NULL, NULL, 415000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:
2 bed 2 bath 1489 sqft / 1950 / 4530 lot sqft.

Last Sale: 400,000 on 11/13/2023 under LLC , RPR loan type showing Stand Alone Second / Subordinate position.
Est loan bal: $437,160 per Prop radar.


Title: Prop radar does show llc with conforming loan of 340k on purchase date. then shows cash out from a different lender 4 days later for 110k.
Stand Alone Second / Subordinate position is what shows as the loan per RPR , RPR distress info does show foreclosure on the LLC. *title needs to be ordered to see what loan is being foreclosed on.

Comp- 604 Rhett St, Greenville, SC 29601- $630,000- 3 bed , similar sqft , right next door.

Comp- 104 N Calhoun St, Greenville, SC 29601- $415,000- 3 bed also , smaller sqft .

Comp - 215 Ware St, Greenville, SC 29601- $370,000 on 12/15/2025 flip , 2/2 under 1k sqft

Comp- 213 S Calhoun St, Greenville, SC 29601- $440,000 on 4/15/2026 , 2/1 under 900sqft similar year .


I like the location of this one . a lot of new construction nearby selling for high prices, even older homes are selling as well.



non conservative are could be close to 500k
conservative based on year - 415k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('4 Point Hope Court', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29605', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:
3Beds 2Baths 1,379Sq Ft / 1996 / 7840 sqft lot

Last Sale: $179,000 on 9/29/2020 FHA per RPR
Est loan bal: $158,390 per Prop radar.

Title: Did not come up on SC pn. 1st in place is the FHA loan , 2nd reflects a conforming loan for 7k on the same date. Title needs to be ordered to confirm the foreclosure is on 1st position.


Comp- 8 Shumagin Ct, Greenville, SC 29605- $248,500 on 2/20/2026 - this one is slightly larger and has a garage, subject no garage .

Comp- 11 River Watch Dr, Greenville, SC 29605- $248,000 on 8/28/2026 - same as before , larger by a bit and garage .

non conservative 240k
conservative- 225k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('110 Water Reach Lane', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29681', '2026-09-08'::date, 'Request Title', NULL, NULL, 450000, NULL, NULL, 40000, NULL, NULL, NULL, NULL, 'Erik:

4 bed 3 bath 3,547 sqft / 2007 / .29 acre

Last sale: $392,000 on 9/21/2007 VA per RPR

Est loan bal: $607,717 per prop radar

Title: No info on SC public notice . Loan plus a 2nd and 3rd cash out refi done. Prop radar  Notice of sale date 8/11/26 have a bid amount of
$339,388.


news article reflect fire at home in 2024: https://www.foxcarolina.com/2024/08/25/greenville-deputies-respond-house-fire-saturday-night/

Zillow and realtor.com reflect 5 bed 3 bath

comp- 27 Waters Reach Ln, Simpsonville, SC 29681- $507,000 on 5/28/2026 . 4/4 3,541 sqft.

Comp- 3 Dunberry Ct, Simpsonville, SC 29681- $465,000 on 4/2/2026 -5/4 3,164 sqft . so a little smaller than the subject property .

Not conservative 475k

conservative- 450k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('603 Stallings Rd', 'Courthouse', 'SC', 'Greenville', 'Taylors', '29687', '2026-09-08'::date, 'Request Title', NULL, NULL, 300000, NULL, NULL, 25000, NULL, NULL, NULL, NULL, 'Erik: listed on auction.com

3 beds 2 baths 1,784 sqft /1972 / .75 acre

Last Sale:  $319,000 FHA on 6/16/2022 per RPR

Est loan bal: $288,154 per prop radar

Title: No info in SC public notice. Per prop radar only lien from
6/16/2022 FHA .


Comp- 301 Stallings Rd #126, Taylors, SC 29687- $231,000 on 4/27/2026, 4/2 2423sqft , larger comp than subject, sale doesn''t look like it was on market, but low comp price wise .

Comp- 105 Kestrel Ct, Taylors, SC 29687- $317,000 on 4/16/2026 3/2 1341sqft  clean flip . went on market at 299k and sold for more. under contract in 3 days.

Comp- 208 Bridgewood Ave, Taylors, SC 29687-$355,000 on 6/23/2026 - 3/2 1924sqft - flip mid level, not too fancy.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('39B W Golden Strip Drive', 'Courthouse', 'SC', 'Greenville', 'Mauldin', '29662', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'Erik:  There''s an A and B at this address.

3 bed 2 bath 1799 sqft (Zillow lists 4 bed). 2001 / .61 acre

Last sale:$115,000 on 3/18/2005  per RPR DOMINIQUE SMITH is owner.

est loan bal: $54,462 per prop radar under DOMINIQUE SMITH

Title: No info on SC public notice. Per prop radar there is a 1st and 2nd, same lender showing conforming loan. notice of sale listed .

comp- 9 W Golden Strip Dr, Mauldin, SC 29662- $275,000 on 3/4/2026 3/2
1782sqft.

Comp- 310 Rosewood Cir, Mauldin, SC 29662- $225,000 on 4/16/2026 3/2 1431sqft , went under contract in days. basic flip , much older than subject . 1967', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('15 Fennec Drive', 'Courthouse', 'SC', 'Greenville', 'Fountain Inn', '29644', '2026-09-08'::date, 'Request Title', NULL, NULL, 265000, NULL, NULL, 5000, NULL, NULL, NULL, NULL, 'Erik:

3 bed 3 bath 1735 sqft / 2023 / .14 acre

Last Sale: $262,999 on 5/11/2023 conventional per RPR

Est loan bal: $252,608 per prop radar

Title: No info on SC public notice. 2nd conforming in place per prop radar for 8k.

Comp- 19 Fennec Dr, Fountain Inn, SC 29644- $299,900 on 3/24/2026 , 3/3 2052sqft , slightly bigger than subject

Comp- 115 Leacock Dr, Fountain Inn, SC 29644- $305,000 on 7/20/2026 3/3 1965sqft , new construction not resale.

similar comps close by as there are pockets of new builds close by.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('104 Pine Needle Road', 'Courthouse', 'SC', 'Greenville', 'Piedmont', '29673', '2026-09-08'::date, 'Request Title', NULL, NULL, 200000, NULL, NULL, 30000, NULL, NULL, NULL, NULL, 'Erik:
3Beds 2Baths 1,360Sq Ft / 2004 / .25 acre

Last Sale: $222,500 on 1/17/2024 USDA Loan per RPR
Est loan bal: $218,105 per prop radar

Title: Prop Radar has it in 1st position.  not coming up on SC PN .

Comp- 110 Pine Needle Rd, Piedmont, SC 29673 - $259,000 4/28/2026 - 4br .

There is a lot of new construction townhomes close by selling in the low 200s

non conservative 225k

conservative 205k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('402 Siena Drive', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29609', '2026-09-08'::date, 'Request Title', NULL, NULL, 1200000, NULL, NULL, 50000, NULL, NULL, NULL, NULL, 'Erik:
4 bed 4 bath 4741sqft / 2000 yr / .64 acre

Last sale: $681,000 on 9/6/2005 per RPR

Est loan bal: unknown per prop radar , RPR does show a loan in 05 and then a possible refi in 07 for $627,496..

Title: No SC public notice info. Prop radar shows a prior loan in 1st and second , but then a market deed in 2005 shows they may have been wiped out as a cash transfer. need to dig into this one.

Comp- 5 Spoleto Ct, Greenville, SC 29609- $1,449,609 on 7/10/2026 , under contract in days. 4/4 4682 sft.

Comp- 206 Siena Dr, Greenville, SC 29609- $1,260,000 on 6/25/2026 4/4 3581 sqft so smaller than subject by 1200 sqft.

Comp- 205 Siena Dr, Greenville, SC 29609- $1,450,000 on 8/31/2026


Hard to tell what rehab is on this one without photos.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('3 Black Oak Court', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29680', '2026-09-08'::date, 'Request Title', NULL, NULL, 250000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'Erik:

3 bed 2 bath 1416sqft / 1995 / 7840 sqft lot

Last Sale: $244,900 on 11/15/2023 FHA per RPR

Est loan bal: $310,527

Title: Cannot locate SC public notice. Cash out refi in 2nd place on title for $72k

Comp-102 W Fall River Way, Simpsonville, SC 29680- $269,000 on 3/9/2026

Comp- 303 S Sandy Brook Way, Simpsonville, SC 29680- $268,000 on 2/19/2026

Comp- 211 Cassidy Ct, Simpsonville, SC 29680- $275,000 on 4/2/2026 - immediately turned into a rental.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('406 Sandusky Lane', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29680', '2026-09-08'::date, 'Request Title', NULL, NULL, 450000, NULL, NULL, 40000, NULL, NULL, NULL, NULL, 'Erik:
4 bed 2.5 bath 3,536 sqft / 2019 yr /

Last sale: for $277,830 on 3/28/2019 per RPR FHA loan
Est loan bal: $243,945 per prop radar

Title: 1st is the main loan. 2nd positions looks like a reverse mortgage per prop radar for $9,866 on 2/3/2025

Comp- 200 Chestatee Ct, Simpsonville, SC 29680 - $474,900 on 6/30/2026 - 5 yrs older than subject.

Comp- 421 Rio Grande Pl, Simpsonville, SC 29680- $464,000 on 7/31/2026 - same 5 yrs older than subject.

Comp - 22 Chestatee Ct, Simpsonville, SC 29680- $445,000 on 4/22/2026 - 12 yrs older , same bed and bath but 700sqft smaller than comp.


Non conservative - $475k
Conservative - 450k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1904 Lake Cunningham Road', 'Courthouse', 'SC', 'Greenville', 'Greer', '29651', '2026-09-08'::date, 'Request Title', NULL, NULL, 215000, NULL, NULL, 55000, NULL, NULL, NULL, NULL, 'Erik:
unknown bed 2 bath 1820sqft / 1990 yr/ .59 acre Manufactured

Last sale:  $198,500 on 8/18/2023 FHA per RPR

est loan bal: $201,000 per prop radar

title: No SC public notice info. Initial loan in 1st ,HUD refi in 2nd position.  No other liens.

Comp- 8 Preakness Ct, Greer, SC 29651- $157,000 on 8/27/2026 under contract in days, listed at 139k and sold for more. as is sale. Inside is dated , but maintained.

Comp- 1304 Cheek Rd, Greer, SC 29651- $255,000 on 4/27/2026, under contract fast.clean simple remodel.

Comp- 1608 S McElhaney Rd, Greer, SC 29651- $207,000 on 10/24/2025 - dated .

Comp- 114 Derby Trl, Greer, SC 29651- $230,000 on 12/12/2025 flip.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('116 Ridgewater Court', 'Courthouse', 'SC', 'Greenville', 'Fountain Inn', '29644', '2026-09-08'::date, 'Request Title', NULL, NULL, 625000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:

5 bed 4 bath 2933sqft / 2018 / .58 acre

Last Sale: $395,710 on 12/26/2018 Conventional per RPR

Est loan bal: $340,000 per prop radar

Title:

comp- 113 Ridgewater Ct, Fountain Inn, SC 29644-$650,000 on 1/15/2026 4/4 3440sqft.

comp- 120 Ivy Woods Ct, Fountain Inn, SC 29644- $650,000 on 4/27/2026 4/4 3437sqft.

Subject is smaller , but has one more bedroom.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('1406 Winding Way', 'Courthouse', 'SC', 'Greenville', 'Taylors', '29687', '2026-09-08'::date, 'Request Title', NULL, NULL, 220000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:
3 bed 2 bath 1735sqft / 1983 yr / .28 acre

Last Sale: $123,000 on 5/15/2009 FHA per RPR
Est loan bal: $99,987 per prop radar

Title: nothing in SC pub notice. 11/8/2017 cash out refi for $120,000. HOA lien in 2nd for $1,854 2/17/2026.

Comp- 1401 Winding Way, Taylors, SC 29687- $235,000 on 7/2/2026

comp- 1106 Charter Oak Dr, Taylors, SC 29687- $246,500 on 6/23/2026

Comp- 1514 Winding Way, Taylors, SC 29687- $239,000 on 3/26/2026

comp - 1603 Winding Way, Taylors, SC 29687 - $230,000 on 8/27/2026

all comps are smaller than subject sqft wise.


non conservative - 230k

conservative  220k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('19 and 21 Whiller Drive', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29608', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:

Shows two addresses 19 is land and 21 is a single fam home.

3 Beds 2 Baths 1,460Sq Ft / 1960 yr / .49 acre |  19 LOT is .34 acre |

Last Sale: $70,000 on 3/1/2023 - owner is ASK ENTERPRISES & FUNDING LLC -shows a foreclosure purchase.

Est loan bal: $60,971 per prop radar shows a loan that started at 125k as a refi.

Title: SC pub notice no info on address. Per prop radar the refi loan for that llc is in 1st position, no other liens.
for 19 Whiler it reflects the same info as if they sold both parcels under one.

Comp- 1 Pinefield Dr, Greenville, SC 29605- $240,000 on 6/1/2026 , good comp , under contract in 13 days.

Comp- 102 Pinefield Dr, Greenville, SC 29605-$182,000 on 6/5/2026 *FIXER , sold in as is condition.

Comp- 111 E Belvedere Rd, Greenville, SC 29605- $281,000 on 5/27/2026 - Fully renovated, garage. super clean. under contact in 20 days. purchased initially for 100k.

LAND VALUE - 30-40k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('104 Oak Forest Drive', 'Courthouse', 'SC', 'Greenville', 'Greer', '29650', '2026-09-08'::date, 'Request Title', NULL, NULL, 365000, NULL, NULL, 10000, NULL, NULL, NULL, NULL, 'Erik: home reflects basic renovation, clean , pool.

5 beds 4 baths 2,870 sqft per Zillow (recent listing) / 1961 / .46acre

Last Sale: $389,900 on 4/11/2022 per RPR FHA , then quit claim deed in 02/2026

Est loan bal: $350,250 per Prop radar.

Title: No info in SC public notice. Mortgage in 1st , not other liens listed on prop radar .

listed on Zillow 03/2025 at 440k  price dropped over time to 380k and no sale.


SMALL COMP- 106 Oak Forest Dr, Greer, SC 29650- $320,000 3/3 1657sqft , smaller than subject, clean , no pool . good idea of start price. next door


Comp- 384 Grand Teton Dr, Greer, SC 29650-$490,000 on 11/21/2025 - 3/2 2200 sqft , flip . Close by comp.

Comp- 109 Buddy Ave, Greer, SC 29651- $390,000 on 4/24/2026 4/2 1900sqft, Again much smaller than subject, this one has above ground pool.

the fact that the home did not sell at 380k is weird/concerning. would want be priced lower than that for a fast sale.


Comps support a ARV in the low 400''s non conservative.

conservative- 365k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('67 Wallace Street', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29605', '2026-09-08'::date, 'Request Title', NULL, NULL, 225000, NULL, NULL, 70000, NULL, NULL, NULL, NULL, 'Erik:

2 bed 1 bath 1119 sqft / 1955 / .2 acre Boarded windows

Last Sale: Most recent deed in 2007 per Prop radar and RPR

Est loan bal: $0 shown in prop radar Refi 8/3/2015 for $36,000

Title: No info in SC public notices. will need to double check title info as prop radar shows a release in 2020 , no liens listed.

Comp- 53 Allen St, Greenville, SC 29605- $240,000 on 3/10/2026 immediately turned into a rental. Flip. very similar size.

Comp- 35 Blake St, Greenville, SC 29605- $268,000 on 4/29/2026 also renovated.2/1 1400 sqft

Comp- 5 Duke St, Greenville, SC 29605- $180,000 on 4/24/2026 - lower end comp, similar size, 2/2 but dated on the inside.

non conservative- 230-240k
conservative - 225k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('100 N. Markley St.', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29601', '2026-09-08'::date, 'Request Title', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '** Large commercial project involving 26 condos and a 133 room hotel. news article: http://upstatebusinessjournal.com/commercial-real-estate/the-vardry-residences-property-in-downtown-greenville-under-foreclosure/


will come back to this one last.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('23 Chinaberry Lane', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29680', '2026-09-08'::date, 'Request Title', NULL, NULL, 245000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'ON AUCTION.COM

Erik:

3 Beds 2 Baths 1,356 Sq. Ft. / 1991 /.4 acre

Last sale:  $92,000 on 10/22/2001 , Intrafamily Transfer in 2003 to BRADLEY KEITH PRESSLEY

Est loan bal: $0 listed on prop radar ,

Title: No notice of sale info on SC pub notice. Per Prop radar there is a notice of sale Bradley listed as owner. still unsure of any liens


Comp- 4 Chinaberry Ln, Simpsonville, SC 29680- $285,000 on 8/20/2026 - great comp, flip , under contract in 3 days.

Comp- 104 Boxelder Ln, Simpsonville, SC 29680- $285,000 on 4/23/2026 - clean , looks renovated recently, slightly bigger than subject.

Comp- 208 Agewood Dr, Simpsonville, SC 29680- $248,000 on 3/6/2026- clean , older year of home, again some updates in past few years.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('302 West Road', 'Courthouse', 'SC', 'Greenville', 'Travelers Rest', '29690', '2026-09-08'::date, 'Request Title', NULL, NULL, 200000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, '* Zillow reflects sold on 8/31/2026 for 168k
*title review / ownership , looks like owner passed away and child took over*

Erik:
3 Bed 2 Bath 1312 sqft / 1964yr / .21 acre

Last Sale: 8/18/26 shows deed of distribution per RPR to WANDA R BROWN REED

Est loan bal: $53,579 per prop radar, refi done in 2014 quicken loans.

Title:No SC public notice info. RPR has WANDA R BROWN REED as owner, previous owner passes as she is in charge of the estate. Previous loan under Robert and Evelyn brown. No second liens per prop radar.

Comp- 224 West Rd, Travelers Rest, SC 29690- $161k on 6/2/2026 then listed for rent right away. 3/1 1116sft clean simple Reno.

New construction happening in the area.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('304 Glenlea Ln', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29617', '2026-09-08'::date, 'Request Title', NULL, NULL, 250000, NULL, NULL, 10000, NULL, NULL, NULL, NULL, '*Zillow shows as pending*

Erik:
3 bed 3 bath 1322sqft / 2004 yr / 5227 sqft lot.
Last Sale: $105,000 on 11/15/2004 per RPR
Est loan bal: $262,245 per prop radar

Title: Prop radar reflects a cash out refi for $297,000 on 11/24/2021. No additional liens listed.

Comp- 712 Highcrest Dr, Greenville, SC 29617 - $232,500 on 5/15/2026 - this one is much more dated than subject

Comp- 515 Glenlea Ln, Greenville, SC 29617- $255,000 on 5/29/2026 - This one has a garage , subject does not.


Unsure how much value a garage adds.  per Zillow it went on market on 12/23/25 then went under contract 7 days later, maybe going short sale route.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('71 Dorsey Avenue', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29611', '2026-09-08'::date, 'Request Title', NULL, NULL, 250000, NULL, NULL, 5000, NULL, NULL, NULL, NULL, 'Erik:
2bed 2 bath 1200 sqft / 1955 / renovated

Owner is also VSWC LLC

Last sale: $100,000 on 10/5/2021 per RPR

est loan bal: $268,447 per prop radar

Title: No info on SC pub notice. There is a 1st , 2nd and 3rd  per prop radar , with the 2 and 3 happening in April 26 , cash out refi''s . recommend order title.

per Zillow listed for $378k in jan , shows pending sale in march , then removed listing in July.


Comp- 46 Dorsey Blvd, Greenville, SC 29611- $264,900 good comp .

Comp- 16 Saco St, Greenville, SC 29611- $275,000 on 7/7/2026

Comps do not support previous list price', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('37 Ross Street', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29611', '2026-09-08'::date, 'Request Title', NULL, NULL, 235000, NULL, NULL, 10000, NULL, NULL, NULL, NULL, 'Erik:

2bed 1 bath 1023 sqft / 1950 yr / .31 acre

owner is VSWC LLC

Last Sale: deed on 9/18/2019 for $58,200 per RPR to an LLC , then  Quitclaim deed on 5/21/2020 for $56,000 to a new LLC .

Est loan bal: $122,862 per prop radar most recent loan is dated 6/27/2023 listed as private lender .

Title: No info on SC pub notice, per Prop Radar most recent private lender loan is in 1st position. no additional liens after.

Comp- 46 Dorsey Blvd, Greenville, SC 29611- $264,900 on 5/15/2026 2/2 1088sqft.

LOW Comp-30 Baldwin St, Greenville, SC 29611- $220,000 on 3/20/2026 , 2/1 932sqft , this one was listed for 262k then sold for way less, low comp , poss something wrong.

Comp- 16 Saco St, Greenville, SC 29611- $275,000 on 4/30/2026. 2/2

Comp- 101 Mason St, Greenville, SC 29611- $197,500 on 5/27/2026 2/1 945sqft

2/1 and 2/2 in that area seem to have a decent price difference.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('11 Charing Cross Road', 'Courthouse', 'SC', 'Greenville', 'Taylors', '29687', '2026-09-08'::date, 'Request Title', NULL, NULL, 215000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:

3 bed 1 bath 1300 sqft / 1973 yr / .37 acre

Last sale: $235,000 on 8/12/2022 Conventional per RPR then a refi 12/29/2023

Est loan bal: $190,176 per prop radar.

Title: No info on SC public notice, No additional liens showing in prop radar. owner is GRM PROPERTIES OF SOUTH CAROLINA LLC, RPR foreclosure lists them as borrower as well.

Comp- 2 Holburn Ln, Taylors, SC 29687- $235,000 on 5/4/2026 good comp.

Comp- 104 Mountain Chase, Taylors, SC 29687- $237,000 on 6/22/2026

Comp- 300 Indian Trl, Taylors, SC 29687- $222,474 on. 6/26/2026', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('2501 Poinsett Highway', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29609', '2026-09-08'::date, 'Request Title', NULL, NULL, 250000, NULL, NULL, 15000, NULL, NULL, NULL, NULL, 'Erik:
3Beds 2Baths 1,494Sq Ft / 1963 / 10,500 sqft lot

Last Sale: $130,000 on 5/2/2022 per RPR LLC owner .. prop radar shows as a construction/ conforming loan from another llc.

Est loan bal: $191,412 per prop radar

Title: Prop Radar does not show any additional liens. No info in SC pub notice.

was listed for 300k recently but then removed in July.

Comp- 9 Callahan Ave, Greenville, SC 29617- $277,500 on 6/4/2026 3/1 a little over 1200 sqft.

Comp- 118 Woodland Dr, Greenville, SC 29617- $281,000 on 5/27/2026

comp- 401 Rogers Ave, Greenville, SC 29617- $243,000 on 6/5/2026  2/1 just over 1k sqft but same

non conservative - 265k off main rd.

conservative 250k', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('202 Port Road', 'Courthouse', 'SC', 'Greenville', 'Greenville', '29617', '2026-09-08'::date, 'Request Title', NULL, NULL, 235000, NULL, NULL, 5000, NULL, NULL, NULL, NULL, 'Erik:
3 bed 2 bath 1484sqft / 2022 /  .59 acre

Last Sale: $247,900 on 5/16/2023 Green Ant LLC as buyer unsure of loan type but it exists per prop radar

Est loan bal: $61,456 per prop radar

Title: Prop radar just shows the one loan in 1st , no additional liens.

No single story comps close by

Comp- 104 White Rapids Way, Greenville, SC 29617- $268,000 on 3/20/2026 , 2 story, 3/3 1372sqft

Comp- 2 Anchor Rd, Greenville, SC 29617- $240,000 on 8/31/2026 2 story , 3/3 1402sqft.

Comp- 25 County Cork Dr, Greenville, SC 29611- $242,000 on 5/21/2026 , 3/2 1120 sqft SINGLE STORY', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb),
('608 Kingsmoor Drive', 'Courthouse', 'SC', 'Greenville', 'Simpsonville', '29681', '2026-09-08'::date, 'Request Title', NULL, NULL, 400000, NULL, NULL, 20000, NULL, NULL, NULL, NULL, 'Erik:
4 Beds 3 Baths 2,582 Sq Ft /2003 / .09 acre

Last sale: $282,000 on 12/8/2020 conventional per RPR

Est loan bal: $314,569 per prop radar

Title: No info on SC public notice.  No additional liens listed.

Comp- 5 Springleaf Ct, Simpsonville, SC 29681- $425,000 on 5/26/2026, 4/4 2990 , under contract in days.

Comp- 549 Kingsmoor Dr, Simpsonville, SC 29681- $410,000 on 10/3/2025. 4/3 2631

Larger Comp- 502 Kingsmoor Dr, Simpsonville, SC 29681- $419,900 on 3/20/2026 , this one sat for a bit.', NULL, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '[]'::jsonb);
