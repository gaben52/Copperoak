'use client';

// Content is identical to the original flat two-column term/meaning table, just grouped into 3
// labeled categories. Each category is still rendered as one real CSS grid (.formula-table below,
// with .formula-row using display:contents) so every term/meaning pair shares the exact same
// column tracks — that's what keeps the term column's left edge and the meaning column's left
// edge perfectly aligned down the whole list, the same technique the original single-table
// version used. A per-entry icon badge was tried in an earlier pass and dropped: it pushed only
// some rows' term text further right than others, which is what made the list look unaligned.
const CATEGORIES = [
  {
    title: 'Value & Profit Metrics',
    terms: [
      { term: 'ARV', meaning: 'After Repair Value. The estimated resale value once the property is renovated. This is the base value used by most formulas below.' },
      { term: 'Profit', meaning: 'ARV multiplied by 0.89, minus Max Bid, minus Reno Cost. The 0.89 factor accounts for typical selling costs.' },
      { term: 'Profit %', meaning: 'Profit divided by ARV.' },
      { term: 'Variance', meaning: 'ARV minus Max Bid. A quick pre bid screen before repair and closing costs.' },
    ],
  },
  {
    title: 'Bid & Status Indicators',
    terms: [
      { term: 'Open Bid', meaning: 'The starting courthouse bid from foreclosurebidlist.com.' },
      { term: 'Max Bid', meaning: 'The maximum amount you are willing to bid on sale day.' },
      { term: '% Complete', meaning: 'The percentage of properties with Open Bid, ARV, and Max Bid completed.' },
      { term: 'Bid Ready', meaning: 'Automatically set when Clear Title is Clear and Mortgage Balance, ARV, and Max Bid are all completed.' },
      { term: 'Location', meaning: 'The auction location or property rating. Options include Courthouse, Auction.com, Unrated, Low, Medium, High, and DNB.' },
      { term: 'Needs Attention', highlight: true, meaning: 'The sale date is within 72 hours and ARV, Max Bid, or Clear Title is still unresolved. The property is flagged with an attention indicator and included in the Needs Attention count.' },
    ],
  },
  {
    title: 'Outcome & Documentation',
    terms: [
      { term: 'Do Not Bid', meaning: 'Setting Clear Title to Do Not Bid automatically archives the property and moves it to the Archived tab.' },
      { term: 'Auction Outcome', meaning: 'The result of the auction. Unknown is the default. Won moves the property to Won Properties. 3rd Party moves it to Lost Homes and removes it from the active county lists.' },
      { term: 'Clear 1st Lien', meaning: 'The title is confirmed clear and the foreclosing loan is in first lien position. Senior liens are wiped out and the property is automatically promoted to Bid Ready.' },
      { term: 'Clear 2nd Lien', meaning: 'The title is confirmed clear but the foreclosing loan is in second lien position. A senior mortgage may survive the sale. The property is flagged for review and must be moved to Bid Ready manually.' },
      { term: 'Trustee Info', meaning: 'The name, phone number, and email of the foreclosing trustee. This information appears in the property detail panel and can be populated through CSV, Excel, or Bulk Paste imports.' },
    ],
  },
];

export default function FormulaGuide() {
  return (
    <div className="panel-box formula-guide">
      <h3>Formula &amp; Definition Guide</h3>

      {CATEGORIES.map((cat, i) => (
        <div className={'formula-group' + (i === CATEGORIES.length - 1 ? ' last' : '')} key={cat.title}>
          <div className="formula-category-title">{cat.title}</div>
          <div className="formula-table">
            {cat.terms.map((t) => (
              <div className={'formula-row' + (t.highlight ? ' formula-row-warn' : '')} key={t.term}>
                <div className="formula-term">{t.term}</div>
                <div className="formula-meaning">{t.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
