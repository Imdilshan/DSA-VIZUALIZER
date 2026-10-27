import React from 'react';

export interface InteractiveStep {
  title: string;
  description: string;
  render: () => React.ReactNode;
}

export function getInteractiveSteps(id: string, themeColor: string = 'var(--accent)'): InteractiveStep[] {
  switch (id) {
    case 'array':
      return [
        {
          title: 'Memory Allocation',
          description: 'Fixed contiguous block of 4 slots allocated at base pointer 0x1000 in O(1).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(18, 38)">
                {[2, 5, 1, 9].map((val, i) => (
                  <g key={i} transform={`translate(${i * 52}, 0)`}>
                    <rect x="0" y="0" width="48" height="34" fill="#141720" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" rx="4" />
                    <text x="24" y="22" textAnchor="middle" fill="#F7F5EF" fontSize="15" fontWeight="700" fontFamily="monospace">{val}</text>
                    <text x="24" y="50" textAnchor="middle" fill="#9B9A95" fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Random Access: arr[1]',
          description: 'Direct offset calculation: Address = base + 1 × 4 bytes = 0x1004. Returns 5 in O(1) time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(18, 38)">
                {[2, 5, 1, 9].map((val, i) => (
                  <g key={i} transform={`translate(${i * 52}, 0)`}>
                    <rect x="0" y="0" width="48" height="34" fill={i === 1 ? 'rgba(214,82,58,0.2)' : '#141720'} stroke={i === 1 ? 'var(--accent)' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 1 ? 2.5 : 1.5} rx="4" />
                    <text x="24" y="22" textAnchor="middle" fill={i === 1 ? 'var(--accent)' : '#F7F5EF'} fontSize="15" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="24" y="50" textAnchor="middle" fill={i === 1 ? 'var(--accent)' : '#9B9A95'} fontSize="11" fontWeight="700" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Push: arr.append(42)',
          description: 'Appends 42 at the next available index [4]. Memory is updated in O(1) amortized.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(8, 38)">
                {[2, 5, 1, 9, 42].map((val, i) => (
                  <g key={i} transform={`translate(${i * 45}, 0)`}>
                    <rect x="0" y="0" width="41" height="34" fill={i === 4 ? 'rgba(56,161,105,0.25)' : '#141720'} stroke={i === 4 ? '#38A169' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 4 ? 2 : 1.5} rx="4" />
                    <text x="20" y="22" textAnchor="middle" fill={i === 4 ? '#38A169' : '#F7F5EF'} fontSize="14" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="20" y="50" textAnchor="middle" fill={i === 4 ? '#38A169' : '#9B9A95'} fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Mutation: arr[2] = 99',
          description: 'In-place update: overwrites value at slot [2] from 1 to 99 with zero overhead.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(8, 38)">
                {[2, 5, 99, 9, 42].map((val, i) => (
                  <g key={i} transform={`translate(${i * 45}, 0)`}>
                    <rect x="0" y="0" width="41" height="34" fill={i === 2 ? 'rgba(229,169,60,0.25)' : '#141720'} stroke={i === 2 ? '#E5A93C' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 2 ? 2.5 : 1.5} rx="4" />
                    <text x="20" y="22" textAnchor="middle" fill={i === 2 ? '#E5A93C' : '#F7F5EF'} fontSize="14" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="20" y="50" textAnchor="middle" fill={i === 2 ? '#E5A93C' : '#9B9A95'} fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
      ];

    case 'sorting':
      return [
        {
          title: 'Initial State',
          description: 'Unsorted array of 5 elements: [35, 22, 68, 95, 50].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[35, 22, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill="#38bdf8" rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Compare: 35 > 22',
          description: 'Comparing index [0]=35 with index [1]=22: Inversion detected! Swap required.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[35, 22, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i < 2 ? '#E5A93C' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Swap: [22, 35]',
          description: 'Swapped elements 35 and 22. Index [0] is now smaller than [1].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i < 2 ? 'var(--accent)' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Pass 1 Complete: 95 in Place',
          description: 'Maximum element 95 has bubbled to the final slot [3]. Marked as sorted.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 68, 50, 95].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i === 4 ? '#38A169' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Array Sorted',
          description: 'All passes complete! Elements in ascending order: [22, 35, 50, 68, 95].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 50, 68, 95].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill="#38A169" rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
      ];

    case 'bitmask':
      return [
        {
          title: '4-Bit Mask Representation',
          description: 'Set {0, 1, 3} mapped to integer 11 in binary: 1 0 1 1.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 30)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1  0  1  1</text>
                <text x="0" y="44" fill="#9B9A95" fontSize="11" fontFamily="monospace">INDEX:  3  2  1  0</text>
                <rect x="-6" y="-2" width="150" height="60" fill="none" stroke="rgba(247,245,239,0.15)" rx="4" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Check Bit 1: (mask & (1 << 1))',
          description: 'Bitwise AND with mask 0010 isolates bit 1: Result = 0010 != 0 (Member is present!).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 20)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1 0 1 1</text>
                <text x="0" y="44" fill="var(--accent)" fontSize="13" fontWeight="800" fontFamily="monospace">&amp; BIT:  0 0 1 0</text>
                <line x1="-5" y1="54" x2="140" y2="54" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
                <text x="0" y="74" fill="#84cc16" fontSize="14" fontWeight="800" fontFamily="monospace">RES  :  0 0 1 0 (TRUE)</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'Set Bit 2: (mask | (1 << 2))',
          description: 'Bitwise OR with 0100 inserts element 2 into set: 1011 | 0100 = 1111 (Decimal 15).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 20)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1 0 1 1</text>
                <text x="0" y="44" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="monospace">| SET:  0 1 0 0</text>
                <line x1="-5" y1="54" x2="140" y2="54" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
                <text x="0" y="74" fill="#38bdf8" fontSize="14" fontWeight="800" fontFamily="monospace">NEW  :  1 1 1 1 (15)</text>
              </g>
            </svg>
          ),
        },
      ];

    case 'linked-list':
      return [
        {
          title: 'Initial Node Chain',
          description: 'Head pointer references node 1 -> node 2 -> node 3 -> null.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">H:1</text>
                <path d="M 36 13 L 66 13 L 66 43 L 76 43" fill="none" stroke="var(--accent)" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="94" y="47" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">2</text>
                <path d="M 112 43 L 142 43 L 142 73 L 152 73" fill="none" stroke="rgba(247,245,239,0.5)" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="170" y="77" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:3</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'Traversal: curr = curr.next',
          description: 'Pointer advances to node 2. Next node accessed via explicit pointer dereference.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#9B9A95" fontSize="11" textAnchor="middle" fontFamily="monospace">1</text>
                <path d="M 36 13 L 66 13 L 66 43 L 76 43" fill="none" stroke="rgba(247,245,239,0.3)" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="rgba(214,82,58,0.2)" stroke="var(--accent)" strokeWidth="2" rx="4" />
                <text x="94" y="47" fill="var(--accent)" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">2*</text>
                <path d="M 112 43 L 142 43 L 142 73 L 152 73" fill="none" stroke="rgba(247,245,239,0.5)" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="170" y="77" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:3</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'In-Place Reversal',
          description: 'curr.next redirected to prev node in O(1) space. Head becomes Tail.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:1</text>
                <path d="M 76 43 L 66 43 L 66 13 L 36 13" fill="none" stroke="#38A169" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="94" y="47" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">2</text>
                <path d="M 152 73 L 142 73 L 142 43 L 112 43" fill="none" stroke="#38A169" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="var(--accent)" strokeWidth="2" rx="4" />
                <text x="170" y="77" fill="var(--accent)" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">H:3</text>
              </g>
            </svg>
          ),
        },
      ];

    case 'binary-heap':
      return [
        {
          title: 'Max-Heap Structure',
          description: 'Parent 90 >= children (60, 75). Complete binary tree satisfies heap property.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="25" x2="70" y2="55" />
                <line x1="120" y1="25" x2="170" y2="55" />
                <line x1="70" y1="55" x2="45" y2="88" />
                <line x1="70" y1="55" x2="95" y2="88" />
              </g>
              <circle cx="120" cy="25" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="120" y="29" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">90</text>
              <circle cx="70" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="70" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">60</text>
              <circle cx="170" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="170" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">75</text>
            </svg>
          ),
        },
        {
          title: 'Insert & Sift-Up',
          description: 'New key 95 inserted at leaf and bubbled up past 60 and 90 to become new root.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="25" x2="70" y2="55" stroke="#38A169" strokeWidth="2" />
                <line x1="120" y1="25" x2="170" y2="55" />
              </g>
              <circle cx="120" cy="25" r="10" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="29" fill="#F7F5EF" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">95</text>
              <circle cx="70" cy="55" r="8" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="70" y="59" fill="var(--accent)" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">90</text>
              <circle cx="170" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="170" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">75</text>
            </svg>
          ),
        },
      ];

    case 'hash-table':
      return [
        {
          title: 'Hash Function: h(k) = k % 5',
          description: 'Key 12 hashes to bucket slot h(12) = 12 % 5 = 2. Placed in O(1) expected time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(32, 16)">
                <circle cx="18" cy="46" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
                <text x="18" y="50" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">12</text>
                <path d="M 26 46 L 76 46" stroke="var(--accent)" strokeWidth="2" fill="none" />
                <rect x="76" y="16" width="22" height="74" fill="#141720" stroke="rgba(247,245,239,0.25)" rx="4" />
                <text x="87" y="57" fill="#f59e0b" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">%5</text>
                <path d="M 98 46 L 140 46" stroke="#38A169" strokeWidth="2" fill="none" />
                <g transform="translate(142, 8)">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <g key={idx} transform={`translate(0, ${idx * 17})`}>
                      <rect x="0" y="0" width="44" height="14" fill={idx === 2 ? '#38A169' : '#141720'} stroke={idx === 2 ? '#38A169' : 'rgba(247,245,239,0.15)'} strokeWidth="1.5" rx="2" />
                      <text x="22" y="11" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">{idx === 2 ? '12' : ''}</text>
                      <text x="-6" y="11" fill="rgba(247,245,239,0.4)" fontSize="9" textAnchor="end" fontFamily="monospace">{idx}</text>
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          ),
        },
        {
          title: 'Collision Resolution (Linear Probe)',
          description: 'Key 22 hashes to slot 2 (Occupied!). Linear probing stores key in next free slot 3.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(32, 16)">
                <circle cx="18" cy="46" r="8" fill="#E5A93C" stroke="#F7F5EF" strokeWidth="1.5" />
                <text x="18" y="50" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">22</text>
                <path d="M 26 46 L 76 46" stroke="#E5A93C" strokeWidth="2" fill="none" />
                <rect x="76" y="16" width="22" height="74" fill="#141720" stroke="rgba(247,245,239,0.25)" rx="4" />
                <g transform="translate(142, 8)">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <g key={idx} transform={`translate(0, ${idx * 17})`}>
                      <rect x="0" y="0" width="44" height="14" fill={idx === 2 ? 'rgba(214,82,58,0.3)' : idx === 3 ? '#E5A93C' : '#141720'} stroke={idx === 3 ? '#E5A93C' : 'rgba(247,245,239,0.15)'} strokeWidth="1.5" rx="2" />
                      <text x="22" y="11" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">{idx === 2 ? '12' : idx === 3 ? '22' : ''}</text>
                      <text x="-6" y="11" fill="rgba(247,245,239,0.4)" fontSize="9" textAnchor="end" fontFamily="monospace">{idx}</text>
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          ),
        },
      ];

    case 'binary-search-tree':
      return [
        {
          title: 'Root Comparison',
          description: 'Search for target 40: compare with root 50. Since 40 < 50, branch left.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="28" x2="65" y2="58" stroke="var(--accent)" strokeWidth="2.5" />
                <line x1="120" y1="28" x2="160" y2="58" />
                <line x1="65" y1="58" x2="40" y2="88" />
                <line x1="65" y1="58" x2="105" y2="88" />
              </g>
              <circle cx="120" cy="28" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="32" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">50</text>
              <circle cx="65" cy="58" r="8" fill="#141720" stroke="#ec4899" strokeWidth="1.5" />
              <text x="65" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">30</text>
              <circle cx="160" cy="58" r="8" fill="#141720" stroke="#ec4899" strokeWidth="1.5" />
              <text x="160" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">70</text>
            </svg>
          ),
        },
        {
          title: 'Target Node Located',
          description: 'Compare 40 with 30: 40 > 30, branch right. Found node 40 in O(log n) time!',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="28" x2="65" y2="58" stroke="var(--accent)" strokeWidth="2" />
                <line x1="120" y1="28" x2="160" y2="58" />
                <line x1="65" y1="58" x2="105" y2="88" stroke="#38A169" strokeWidth="2.5" />
              </g>
              <circle cx="120" cy="28" r="9" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <text x="120" y="32" fill="#9B9A95" fontSize="9" textAnchor="middle" fontFamily="monospace">50</text>
              <circle cx="65" cy="58" r="8" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <text x="65" y="62" fill="#9B9A95" fontSize="9" textAnchor="middle" fontFamily="monospace">30</text>
              <circle cx="105" cy="88" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="105" y="92" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">40</text>
            </svg>
          ),
        },
      ];

    case 'graph-traversal':
      return [
        {
          title: 'BFS: Start Vertex 0',
          description: 'Queue = [0]. Mark start vertex 0 as visited (highlighted).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" />
                <line x1="80" y1="35" x2="50" y2="85" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="160" cy="35" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="50" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="190" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Explore Neighbors: [1, 2]',
          description: 'Dequeue 0. Enqueue adjacent vertices 1 and 2 at depth level 1.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="80" y1="35" x2="50" y2="85" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="8" fill="#141720" stroke="#38A169" strokeWidth="2" />
              <circle cx="160" cy="35" r="8" fill="#6366f1" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="50" cy="85" r="8" fill="#6366f1" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="190" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Complete BFS Traversal',
          description: 'All vertices discovered in layer-by-layer order [0, 1, 2, 3, 4] in O(V + E).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" />
                <line x1="80" y1="35" x2="50" y2="85" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="160" cy="35" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="50" cy="85" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="190" cy="85" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
      ];

    case 'min-spanning-tree':
      return [
        {
          title: 'Sorted Edges by Weight',
          description: 'Edges: (A,B:1), (B,C:2), (C,D:3), (A,D:4). Kruskal greedy loop begins.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
                <line x1="60" y1="35" x2="180" y2="35" />
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
                <line x1="60" y1="95" x2="60" y2="35" />
              </g>
              <circle cx="60" cy="35" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="180" cy="35" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="180" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="60" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Add Lightest Edge (w=1)',
          description: 'Edge (A, B) with weight 1 added to MST. Sets {A} and {B} merged.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
                <line x1="60" y1="95" x2="60" y2="35" />
              </g>
              <line x1="60" y1="35" x2="180" y2="35" stroke="#ea580c" strokeWidth="3" />
              <circle cx="60" cy="35" r="8" fill="#ea580c" stroke="#F7F5EF" />
              <circle cx="180" cy="35" r="8" fill="#ea580c" stroke="#F7F5EF" />
              <circle cx="180" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="60" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'MST Complete (V-1 Edges)',
          description: 'Edges (A,B), (B,C), (C,D) form minimal spanning tree with zero cycles.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#ea580c" strokeWidth="3" fill="none">
                <line x1="60" y1="35" x2="180" y2="35" />
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
              </g>
              <line x1="60" y1="95" x2="60" y2="35" stroke="rgba(247,245,239,0.15)" strokeDasharray="3,3" strokeWidth="1.5" />
              <circle cx="60" cy="35" r="8" fill="#ea580c" />
              <circle cx="180" cy="35" r="8" fill="#ea580c" />
              <circle cx="180" cy="95" r="8" fill="#ea580c" />
              <circle cx="60" cy="95" r="8" fill="#ea580c" />
            </svg>
          ),
        },
      ];

    case 'ss-shortest-paths':
      return [
        {
          title: 'Dijkstra Source Setup',
          description: 'Source S has dist[S] = 0; all other vertices initialized to ∞.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" />
                <line x1="50" y1="65" x2="120" y2="95" />
                <line x1="120" y1="35" x2="190" y2="65" />
                <line x1="120" y1="95" x2="190" y2="65" />
              </g>
              <circle cx="50" cy="65" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="120" cy="35" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="95" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="190" cy="65" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Edge Relaxation: dist[u] + w < dist[v]',
          description: 'Relaxing neighbors of S: dist[A] = 2, dist[B] = 5.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" stroke="#10b981" strokeWidth="2.5" />
                <line x1="50" y1="65" x2="120" y2="95" stroke="#10b981" strokeWidth="2.5" />
                <line x1="120" y1="35" x2="190" y2="65" />
                <line x1="120" y1="95" x2="190" y2="65" />
              </g>
              <circle cx="50" cy="65" r="8" fill="var(--accent)" stroke="#F7F5EF" />
              <circle cx="120" cy="35" r="8" fill="#10b981" stroke="#F7F5EF" />
              <circle cx="120" cy="95" r="8" fill="#10b981" stroke="#F7F5EF" />
              <circle cx="190" cy="65" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" />
            </svg>
          ),
        },
        {
          title: 'Shortest Path Tree Established',
          description: 'Optimal path to destination T found with total minimal cost = 6.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#10b981" strokeWidth="2.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" />
                <line x1="120" y1="35" x2="190" y2="65" />
              </g>
              <line x1="50" y1="65" x2="120" y2="95" stroke="rgba(247,245,239,0.2)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="50" cy="65" r="8" fill="var(--accent)" />
              <circle cx="120" cy="35" r="8" fill="#10b981" />
              <circle cx="190" cy="65" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'cycle-finding':
      return [
        {
          title: 'Floyd Pointer Setup',
          description: 'Tortoise (slow, speed=1) and Hare (fast, speed=2) both begin at list head.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#06b6d4" strokeWidth="2" />
              </g>
              <circle cx="45" cy="85" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="45" y="89" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle">S</text>
            </svg>
          ),
        },
        {
          title: 'Hare Laps Inside Cycle',
          description: 'Fast pointer loops through cycle twice as quickly as Slow pointer.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#06b6d4" strokeWidth="2" />
              </g>
              <circle cx="135" cy="70" r="7" fill="var(--accent)" stroke="#F7F5EF" />
              <text x="135" y="74" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">S</text>
              <circle cx="185" cy="70" r="7" fill="#38A169" stroke="#F7F5EF" />
              <text x="185" y="74" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">F</text>
            </svg>
          ),
        },
        {
          title: 'Collision Detected (Cycle Found!)',
          description: 'Slow == Fast inside the loop! Cycle detected in O(n) time and O(1) extra memory.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#38A169" strokeWidth="2.5" />
              </g>
              <circle cx="160" cy="45" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="160" y="49" fill="#F7F5EF" fontSize="8" fontWeight="900" textAnchor="middle">S=F</text>
            </svg>
          ),
        },
      ];

    case 'graph-structures':
      return [
        {
          title: 'Adjacency Matrix Representation',
          description: 'Dense V×V bit table showing directed edges with O(1) query time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(60, 25)">
                <text x="35" y="-5" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">0  1  2  3</text>
                {[[0, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 0]].map((row, r) => (
                  <g key={r} transform={`translate(0, ${r * 22})`}>
                    <text x="-15" y="15" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">{r}</text>
                    {row.map((val, c) => (
                      <rect key={c} x={c * 24} y="0" width="20" height="18" fill={val ? 'rgba(56,189,248,0.2)' : '#141720'} stroke={val ? '#38bdf8' : 'rgba(247,245,239,0.1)'} rx="2" />
                    ))}
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Adjacency List Structure',
          description: 'Sparse vector of linked arrays: each vertex stores only its outgoing neighbors.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(25, 20)">
                {[
                  { u: 0, neighbors: [1, 2] },
                  { u: 1, neighbors: [2, 3] },
                  { u: 2, neighbors: [3] },
                  { u: 3, neighbors: [0] },
                ].map((row, i) => (
                  <g key={i} transform={`translate(0, ${i * 25})`}>
                    <rect x="0" y="0" width="24" height="20" fill="var(--accent)" rx="3" />
                    <text x="12" y="14" fill="#F7F5EF" fontSize="11" fontWeight="700" textAnchor="middle">{row.u}</text>
                    <line x1="24" y1="10" x2="42" y2="10" stroke="#F7F5EF" strokeWidth="1.5" />
                    {row.neighbors.map((v, j) => (
                      <g key={j} transform={`translate(${45 + j * 38}, 0)`}>
                        <rect x="0" y="0" width="24" height="20" fill="#141720" stroke="#38bdf8" strokeWidth="1.5" rx="3" />
                        <text x="12" y="14" fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor="middle">{v}</text>
                      </g>
                    ))}
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Graph Traversal Efficiency',
          description: 'Iterating through edges takes O(V + E) time, ideal for sparse web graphs.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38bdf8" strokeWidth="2" fill="none">
                <line x1="50" y1="40" x2="110" y2="30" />
                <line x1="50" y1="40" x2="110" y2="85" />
                <line x1="110" y1="30" x2="180" y2="55" />
                <line x1="110" y1="85" x2="180" y2="55" />
              </g>
              <circle cx="50" cy="40" r="10" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="110" cy="30" r="10" fill="#38bdf8" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="110" cy="85" r="10" fill="#38bdf8" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="55" r="10" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'union-find':
      return [
        {
          title: 'Disjoint Sets Initialization',
          description: 'Every element starts as its own representative root: parent[i] = i.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(25, 45)">
                {[0, 1, 2, 3, 4].map((v, i) => (
                  <g key={i} transform={`translate(${i * 40}, 0)`}>
                    <circle cx="16" cy="16" r="14" fill="#141720" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="16" y="20" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle">{v}</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Union(1, 2) & Union(3, 4)',
          description: 'Parent pointers redirect child roots to parent root using rank balancing.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#f59e0b" strokeWidth="2" fill="none">
                <line x1="60" y1="75" x2="60" y2="35" />
                <line x1="160" y1="75" x2="160" y2="35" />
              </g>
              <circle cx="60" cy="35" r="13" fill="#f59e0b" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="60" y="39" fill="#111" fontSize="11" fontWeight="800" textAnchor="middle">1</text>
              <circle cx="60" cy="75" r="11" fill="#141720" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="60" y="79" fill="#F7F5EF" fontSize="11" textAnchor="middle">2</text>
              <circle cx="160" cy="35" r="13" fill="#f59e0b" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="160" y="39" fill="#111" fontSize="11" fontWeight="800" textAnchor="middle">3</text>
              <circle cx="160" cy="75" r="11" fill="#141720" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="160" y="79" fill="#F7F5EF" fontSize="11" textAnchor="middle">4</text>
            </svg>
          ),
        },
        {
          title: 'Find with Path Compression: O(α(N))',
          description: 'Path compression flattens the tree directly to root during find queries.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2" fill="none">
                <line x1="70" y1="75" x2="120" y2="35" />
                <line x1="120" y1="75" x2="120" y2="35" />
                <line x1="170" y1="75" x2="120" y2="35" />
              </g>
              <circle cx="120" cy="35" r="14" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="39" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle">Root</text>
              <circle cx="70" cy="75" r="10" fill="#141720" stroke="#38A169" strokeWidth="1.5" />
              <circle cx="120" cy="75" r="10" fill="#141720" stroke="#38A169" strokeWidth="1.5" />
              <circle cx="170" cy="75" r="10" fill="#141720" stroke="#38A169" strokeWidth="1.5" />
            </svg>
          ),
        },
      ];

    case 'fenwick-tree':
      return [
        {
          title: 'Binary Indexed Tree Structure',
          description: 'Each slot tree[i] stores partial sum for range of length (i & -i).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(15, 30)">
                {[
                  { idx: 1, val: 3 },
                  { idx: 2, val: 5 },
                  { idx: 3, val: 2 },
                  { idx: 4, val: 14 },
                  { idx: 5, val: 7 },
                ].map((item, i) => (
                  <g key={i} transform={`translate(${i * 42}, 0)`}>
                    <rect x="0" y={35 - item.idx * 5} width="35" height="24" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" rx="3" />
                    <text x="17" y={51 - item.idx * 5} fill="#06b6d4" fontSize="11" fontWeight="700" textAnchor="middle">{item.val}</text>
                    <text x="17" y="70" fill="var(--text-muted)" fontSize="9" fontFamily="monospace" textAnchor="middle">[{item.idx}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Prefix Sum Query: i -= (i & -i)',
          description: 'Accumulates sub-ranges by stripping lowest set bit in O(log N).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <path d="M 180,50 Q 130,15 80,50" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="180" cy="50" r="12" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="180" y="54" fill="#F7F5EF" fontSize="10" fontWeight="700" textAnchor="middle">i=7</text>
              <circle cx="80" cy="50" r="12" fill="#06b6d4" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="80" y="54" fill="#111" fontSize="10" fontWeight="700" textAnchor="middle">i=6</text>
            </svg>
          ),
        },
        {
          title: 'Point Update: i += (i & -i)',
          description: 'Updates value and propagates diff up the power-of-two chain in O(log N).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2" fill="none">
                <line x1="50" y1="65" x2="110" y2="45" />
                <line x1="110" y1="45" x2="180" y2="25" />
              </g>
              <circle cx="50" cy="65" r="10" fill="#38A169" />
              <circle cx="110" cy="45" r="10" fill="#38A169" />
              <circle cx="180" cy="25" r="12" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'segment-tree':
      return [
        {
          title: 'Full Binary Range Tree',
          description: 'Root covers [0..N-1], each internal node stores aggregate of left and right halves.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1.5">
                <line x1="120" y1="25" x2="65" y2="60" />
                <line x1="120" y1="25" x2="175" y2="60" />
                <line x1="65" y1="60" x2="40" y2="95" />
                <line x1="65" y1="60" x2="90" y2="95" />
              </g>
              <circle cx="120" cy="25" r="14" fill="#141720" stroke="#8b5cf6" strokeWidth="2" />
              <text x="120" y="29" fill="#8b5cf6" fontSize="10" fontWeight="700" textAnchor="middle">[0..7]</text>
              <circle cx="65" cy="60" r="12" fill="#141720" stroke="#8b5cf6" strokeWidth="1.5" />
              <circle cx="175" cy="60" r="12" fill="#141720" stroke="#8b5cf6" strokeWidth="1.5" />
              <circle cx="40" cy="95" r="9" fill="#141720" stroke="rgba(247,245,239,0.3)" />
              <circle cx="90" cy="95" r="9" fill="#141720" stroke="rgba(247,245,239,0.3)" />
            </svg>
          ),
        },
        {
          title: 'Range Query: sum(L, R)',
          description: 'Partitions target query [2..6] into O(log N) canonical non-overlapping segments.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#8b5cf6" strokeWidth="2">
                <line x1="120" y1="25" x2="65" y2="60" />
                <line x1="120" y1="25" x2="175" y2="60" />
              </g>
              <circle cx="65" cy="60" r="13" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="65" y="64" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle">[2..3]</text>
              <circle cx="175" cy="60" r="13" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="175" y="64" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle">[4..6]</text>
            </svg>
          ),
        },
        {
          title: 'Point Update & Propagation',
          description: 'Leaf element modified in O(1) and parent nodes recomputed bubbling up to root.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2">
                <line x1="40" y1="95" x2="65" y2="60" />
                <line x1="65" y1="60" x2="120" y2="25" />
              </g>
              <circle cx="40" cy="95" r="10" fill="#38A169" />
              <circle cx="65" cy="60" r="11" fill="#38A169" />
              <circle cx="120" cy="25" r="14" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'recursion-tree':
      return [
        {
          title: 'Initial Call Frame: solve(N)',
          description: 'Root function frame placed onto runtime execution call stack.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="35" r="16" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="40" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle">f(4)</text>
            </svg>
          ),
        },
        {
          title: 'Branching: 2^k Subproblems',
          description: 'Recursive divide and conquer branches into independent child frames.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="120" y1="35" x2="70" y2="70" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="120" y1="35" x2="170" y2="70" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="120" cy="35" r="14" fill="#141720" stroke="var(--accent)" strokeWidth="2" />
              <text x="120" y="39" fill="var(--accent)" fontSize="10" fontWeight="700" textAnchor="middle">f(4)</text>
              <circle cx="70" cy="70" r="12" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="70" y="74" fill="#F7F5EF" fontSize="10" fontWeight="700" textAnchor="middle">f(3)</text>
              <circle cx="170" cy="70" r="12" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="170" y="74" fill="#F7F5EF" fontSize="10" fontWeight="700" textAnchor="middle">f(2)</text>
            </svg>
          ),
        },
        {
          title: 'Base Case Return & Combining',
          description: 'Base cases hit O(1) leaves; stack frames unwind returning combined values.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="35" r="15" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="39" fill="#F7F5EF" fontSize="10" fontWeight="800" textAnchor="middle">ret=3</text>
            </svg>
          ),
        },
      ];

    case 'suffix-tree':
      return [
        {
          title: 'Compressed Trie of All Suffixes',
          description: 'Compact character tree representing all substrings of input string.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="120" y1="25" x2="60" y2="65" stroke="#ec4899" strokeWidth="1.5" />
              <line x1="120" y1="25" x2="120" y2="65" stroke="#ec4899" strokeWidth="1.5" />
              <line x1="120" y1="25" x2="180" y2="65" stroke="#ec4899" strokeWidth="1.5" />
              <circle cx="120" cy="25" r="10" fill="#141720" stroke="#ec4899" strokeWidth="2" />
              <circle cx="60" cy="65" r="8" fill="#ec4899" />
              <circle cx="120" cy="65" r="8" fill="#ec4899" />
              <circle cx="180" cy="65" r="8" fill="#ec4899" />
            </svg>
          ),
        },
        {
          title: 'Suffix Links & Ukkonen Linear Build',
          description: 'Internal nodes connected via suffix links enabling O(N) linear time construction.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <path d="M 60,65 Q 90,45 120,65" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="60" cy="65" r="9" fill="#141720" stroke="#ec4899" strokeWidth="2" />
              <circle cx="120" cy="65" r="9" fill="#ec4899" />
            </svg>
          ),
        },
        {
          title: 'O(M) Pattern Search Query',
          description: 'Any pattern of length M checked in O(M) time independent of corpus size.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="60" r="14" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="64" fill="#F7F5EF" fontSize="10" fontWeight="800" textAnchor="middle">Found</text>
            </svg>
          ),
        },
      ];

    case 'suffix-array':
      return [
        {
          title: 'Sorted Suffix Permutations',
          description: 'Permutation array of starting indices of sorted suffixes.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(25, 40)">
                {[
                  { sa: 5, str: 'a' },
                  { sa: 3, str: 'ana' },
                  { sa: 1, str: 'anana' },
                  { sa: 0, str: 'banana' },
                ].map((item, i) => (
                  <g key={i} transform={`translate(${i * 48}, 0)`}>
                    <rect x="0" y="0" width="42" height="30" fill="#141720" stroke="#ec4899" strokeWidth="1.5" rx="3" />
                    <text x="21" y="20" fill="#ec4899" fontSize="12" fontWeight="700" textAnchor="middle">{item.sa}</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Longest Common Prefix (LCP)',
          description: 'Kasai algorithm computes shared prefix lengths between adjacent sorted suffixes in O(N).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 40)">
                {[1, 3, 0].map((lcp, i) => (
                  <g key={i} transform={`translate(${i * 50}, 0)`}>
                    <rect x="0" y="0" width="40" height="26" fill="rgba(236,72,153,0.2)" stroke="#ec4899" rx="3" />
                    <text x="20" y="17" fill="#F7F5EF" fontSize="11" fontWeight="700" textAnchor="middle">LCP={lcp}</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Binary Search Match: O(M log N)',
          description: 'Fast substring pattern existence check using binary search on sorted index array.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="55" r="14" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="59" fill="#F7F5EF" fontSize="10" fontWeight="800" textAnchor="middle">Matched</text>
            </svg>
          ),
        },
      ];

    case 'geometry-polygon':
      return [
        {
          title: 'Polygon Vertex Ordering',
          description: 'Vertices ordered counter-clockwise with closed perimeter boundary.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="50,90 120,30 190,60 160,105 80,105" fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="2" />
              <circle cx="50" cy="90" r="5" fill="#a855f7" />
              <circle cx="120" cy="30" r="5" fill="#a855f7" />
              <circle cx="190" cy="60" r="5" fill="#a855f7" />
              <circle cx="160" cy="105" r="5" fill="#a855f7" />
              <circle cx="80" cy="105" r="5" fill="#a855f7" />
            </svg>
          ),
        },
        {
          title: 'Shoelace Formula: Area Calculation',
          description: 'Sum of cross products: 2×Area = Σ (x_i y_{i+1} - x_{i+1} y_i) in O(N).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="50,90 120,30 190,60 160,105 80,105" fill="rgba(168,85,247,0.3)" stroke="#a855f7" strokeWidth="2" />
              <text x="120" y="80" fill="#F7F5EF" fontSize="12" fontWeight="800" textAnchor="middle">Area = 42.5</text>
            </svg>
          ),
        },
        {
          title: 'Point-in-Polygon Ray Casting',
          description: 'Horizontal test ray intersects polygon boundary odd number of times (inside).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="50,90 120,30 190,60 160,105 80,105" fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="2" />
              <line x1="20" y1="75" x2="220" y2="75" stroke="#38A169" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="115" cy="75" r="6" fill="#38A169" stroke="#F7F5EF" />
            </svg>
          ),
        },
      ];

    case 'convex-hull':
      return [
        {
          title: 'Polar Angle Sort from Anchor',
          description: 'Find lowest y-coordinate anchor point and sort remaining points by polar angle.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="60" cy="100" r="7" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <text x="60" y="118" fill="var(--accent)" fontSize="9" fontWeight="700" textAnchor="middle">Anchor</text>
              {[
                [100, 40], [140, 75], [170, 30], [190, 85], [120, 80],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="5" fill="#a855f7" />
              ))}
            </svg>
          ),
        },
        {
          title: 'Graham Scan: CCW Cross Product',
          description: 'Pop non-left turns using 2D cross product until strictly counter-clockwise.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="60" y1="100" x2="100" y2="40" stroke="#a855f7" strokeWidth="2" />
              <line x1="100" y1="40" x2="170" y2="30" stroke="#a855f7" strokeWidth="2" />
              <circle cx="170" cy="30" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Convex Hull Enclosing Boundary',
          description: 'Minimal perimeter convex polygon enclosing all 2D points constructed in O(N log N).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="60,100 100,40 170,30 190,85" fill="rgba(56,161,105,0.2)" stroke="#38A169" strokeWidth="2.5" />
              <circle cx="140" cy="75" r="4" fill="rgba(247,245,239,0.4)" />
              <circle cx="120" cy="80" r="4" fill="rgba(247,245,239,0.4)" />
            </svg>
          ),
        },
      ];

    case 'network-flow':
      return [
        {
          title: 'Residual Network & Source/Sink',
          description: 'Graph with directed capacities from source node S to sink node T.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="40" y1="65" x2="110" y2="35" stroke="#3b82f6" strokeWidth="2" />
              <line x1="40" y1="65" x2="110" y2="95" stroke="#3b82f6" strokeWidth="2" />
              <line x1="110" y1="35" x2="190" y2="65" stroke="#3b82f6" strokeWidth="2" />
              <line x1="110" y1="95" x2="190" y2="65" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="40" cy="65" r="10" fill="var(--accent)" stroke="#F7F5EF" />
              <circle cx="110" cy="35" r="8" fill="#141720" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="110" cy="95" r="8" fill="#141720" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="190" cy="65" r="10" fill="#38A169" stroke="#F7F5EF" />
            </svg>
          ),
        },
        {
          title: 'Augmenting Path Search (BFS)',
          description: 'Edmonds-Karp finds shortest path with residual capacity > 0 and pushes bottleneck flow.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="40" y1="65" x2="110" y2="35" stroke="#10b981" strokeWidth="3" />
              <line x1="110" y1="35" x2="190" y2="65" stroke="#10b981" strokeWidth="3" />
              <circle cx="40" cy="65" r="9" fill="var(--accent)" />
              <circle cx="110" cy="35" r="9" fill="#10b981" />
              <circle cx="190" cy="65" r="9" fill="#38A169" />
            </svg>
          ),
        },
        {
          title: 'Max-Flow Min-Cut Saturated',
          description: 'No augmenting path remains. Maximum total flow equal to minimum cut capacity.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="115" y1="15" x2="115" y2="115" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4,4" />
              <text x="120" y="65" fill="var(--accent)" fontSize="11" fontWeight="800">Min Cut</text>
            </svg>
          ),
        },
      ];

    case 'graph-matching':
      return [
        {
          title: 'Bipartite Partitions (U and V)',
          description: 'Vertices partitioned into disjoint sets U and V with edges only between partitions.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              {[35, 65, 95].map((y, i) => (
                <g key={i}>
                  <circle cx="60" cy={y} r="8" fill="#3b82f6" stroke="#F7F5EF" strokeWidth="1.5" />
                  <circle cx="180" cy={y} r="8" fill="#ec4899" stroke="#F7F5EF" strokeWidth="1.5" />
                  <line x1="68" y1={y} x2="172" y2={y} stroke="rgba(247,245,239,0.2)" strokeWidth="1" />
                </g>
              ))}
            </svg>
          ),
        },
        {
          title: 'Hopcroft-Karp Augmenting Path',
          description: 'Alternates between unmatched and matched edges to augment matching size.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="68" y1="35" x2="172" y2="65" stroke="#38A169" strokeWidth="2.5" />
              <line x1="68" y1="65" x2="172" y2="35" stroke="rgba(247,245,239,0.2)" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="68" y1="95" x2="172" y2="95" stroke="#38A169" strokeWidth="2.5" />
            </svg>
          ),
        },
        {
          title: 'Maximum Cardinality Matching',
          description: 'Maximum independent edge subset without shared endpoints in O(E √V) time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="68" y1="35" x2="172" y2="35" stroke="#38A169" strokeWidth="3" />
              <line x1="68" y1="65" x2="172" y2="95" stroke="#38A169" strokeWidth="3" />
              <line x1="68" y1="95" x2="172" y2="65" stroke="#38A169" strokeWidth="3" />
            </svg>
          ),
        },
      ];

    case 'min-vertex-cover':
      return [
        {
          title: 'Graph Edges Requiring Coverage',
          description: 'Goal: Select minimal subset of vertices such that every edge touches at least one selected vertex.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5">
                <line x1="60" y1="50" x2="120" y2="30" />
                <line x1="120" y1="30" x2="180" y2="50" />
                <line x1="120" y1="30" x2="120" y2="95" />
              </g>
              <circle cx="60" cy="50" r="7" fill="#141720" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="120" cy="30" r="7" fill="#141720" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="180" cy="50" r="7" fill="#141720" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="120" cy="95" r="7" fill="#141720" stroke="#f43f5e" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: '2-Approximation Greedy Selection',
          description: 'Select both endpoints of an uncovered edge to guarantee within 2× of optimal.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="30" r="10" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="120" cy="95" r="10" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
        {
          title: 'All Edges Covered by Selected Set',
          description: 'Every edge has at least one endpoint in cover; verified NP-Hard optimization.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="30" r="11" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="120" cy="95" r="11" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'steiner-tree':
      return [
        {
          title: 'Terminal Vertices Identified',
          description: 'Specific required subset of terminals that must be interconnected.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="60" cy="40" r="8" fill="#f43f5e" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="40" r="8" fill="#f43f5e" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="100" r="8" fill="#f43f5e" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Steiner Points Introduction',
          description: 'Adding intermediate junction vertices lowers total network spanning wire length.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="65" r="6" fill="#38bdf8" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="120" y="55" fill="#38bdf8" fontSize="9" textAnchor="middle">Steiner</text>
            </svg>
          ),
        },
        {
          title: 'Minimal Steiner Tree Topology',
          description: 'All 3 terminals connected via 120° Fermat-Torricelli Steiner junction.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="60" y1="40" x2="120" y2="65" stroke="#38A169" strokeWidth="2.5" />
              <line x1="180" y1="40" x2="120" y2="65" stroke="#38A169" strokeWidth="2.5" />
              <line x1="120" y1="100" x2="120" y2="65" stroke="#38A169" strokeWidth="2.5" />
              <circle cx="60" cy="40" r="8" fill="#f43f5e" />
              <circle cx="180" cy="40" r="8" fill="#f43f5e" />
              <circle cx="120" cy="100" r="8" fill="#f43f5e" />
              <circle cx="120" cy="65" r="6" fill="#38A169" />
            </svg>
          ),
        },
      ];

    case 'traveling-salesperson':
      return [
        {
          title: 'Initial Tour Permutation',
          description: 'Initial closed cycle visiting every city once before returning to origin.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="50,45 130,25 190,65 140,105 70,95" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="50" cy="45" r="6" fill="#f43f5e" />
              <circle cx="130" cy="25" r="6" fill="#f43f5e" />
              <circle cx="190" cy="65" r="6" fill="#f43f5e" />
              <circle cx="140" cy="105" r="6" fill="#f43f5e" />
              <circle cx="70" cy="95" r="6" fill="#f43f5e" />
            </svg>
          ),
        },
        {
          title: '2-Opt Crossing Edge Swap',
          description: 'Detects crossing edge pairs and reverses sub-tour to untangle and decrease distance.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <line x1="50" y1="45" x2="190" y2="65" stroke="var(--accent)" strokeWidth="2" />
              <line x1="130" y1="25" x2="70" y2="95" stroke="var(--accent)" strokeWidth="2" />
            </svg>
          ),
        },
        {
          title: 'Optimal Uncrossed Hamiltonian Tour',
          description: 'Local minimum converged; optimal tour with minimum total travel cost.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="50,45 130,25 190,65 140,105 70,95" fill="rgba(56,161,105,0.15)" stroke="#38A169" strokeWidth="2.5" />
            </svg>
          ),
        },
      ];

    case 'np-complete-reductions':
      return [
        {
          title: 'Polynomial-Time Reduction: A ≤p B',
          description: 'Maps instance of problem A to problem B in polynomial time O(N^k).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <rect x="30" y="40" width="60" height="40" fill="#141720" stroke="#f43f5e" strokeWidth="1.5" rx="4" />
              <text x="60" y="65" fill="#f43f5e" fontSize="12" fontWeight="700" textAnchor="middle">3-SAT</text>
              <line x1="90" y1="60" x2="145" y2="60" stroke="#F7F5EF" strokeWidth="2" />
              <rect x="150" y="40" width="60" height="40" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
              <text x="180" y="65" fill="#38A169" fontSize="12" fontWeight="700" textAnchor="middle">Clique</text>
            </svg>
          ),
        },
        {
          title: 'Clause Gadget Construction',
          description: 'Transforms clauses into triangle gadgets with consistency edges between complements.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <polygon points="120,30 90,85 150,85" fill="rgba(244,63,94,0.15)" stroke="#f43f5e" strokeWidth="2" />
              <circle cx="120" cy="30" r="6" fill="#f43f5e" />
              <circle cx="90" cy="85" r="6" fill="#f43f5e" />
              <circle cx="150" cy="85" r="6" fill="#f43f5e" />
            </svg>
          ),
        },
        {
          title: 'Certifier Verification: NP Completeness',
          description: 'Instance of A is satisfiable if and only if constructed instance of B has solution.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <circle cx="120" cy="60" r="16" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="65" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle">Q.E.D.</text>
            </svg>
          ),
        },
      ];

    default:
      // Generic animated step sequence for remaining advanced topics
      return [
        {
          title: 'Algorithm Setup & State',
          description: `Initial data representation and graph/tree topology prepared in memory.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="60" y1="40" x2="120" y2="30" />
                <line x1="120" y1="30" x2="180" y2="50" />
                <line x1="180" y1="50" x2="150" y2="95" />
                <line x1="150" y1="95" x2="70" y2="90" />
                <line x1="70" y1="90" x2="60" y2="40" />
              </g>
              <circle cx="60" cy="40" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="120" cy="30" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="180" cy="50" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="150" cy="95" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="70" cy="90" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Processing & Invariant Check',
          description: `Core algorithm loop executing operations according to invariant rules.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke={themeColor} strokeWidth="2" fill="none">
                <line x1="60" y1="40" x2="120" y2="30" />
                <line x1="120" y1="30" x2="180" y2="50" />
              </g>
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1" strokeDasharray="3,3" fill="none">
                <line x1="180" y1="50" x2="150" y2="95" />
                <line x1="150" y1="95" x2="70" y2="90" />
                <line x1="70" y1="90" x2="60" y2="40" />
              </g>
              <circle cx="60" cy="40" r="7" fill={themeColor} stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="30" r="7" fill={themeColor} stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="50" r="7" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="150" cy="95" r="5" fill="#141720" stroke="rgba(247,245,239,0.4)" />
              <circle cx="70" cy="90" r="5" fill="#141720" stroke="rgba(247,245,239,0.4)" />
            </svg>
          ),
        },
        {
          title: 'Solution Reached / Converged',
          description: `All criteria verified. Optimal result or structure fully constructed.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2.5" fill="none">
                <polygon points="60,40 120,30 180,50 150,95 70,90" fill="rgba(56,161,105,0.12)" />
              </g>
              <circle cx="60" cy="40" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="30" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="50" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="150" cy="95" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="70" cy="90" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
      ];
  }
}
