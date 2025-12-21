import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('cbt_data.db')
cursor = conn.cursor()

# Ensure the table exists
cursor.execute('''
    CREATE TABLE IF NOT EXISTS cbt_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
    )
''')

# Anger-related CBT entries
cbt_data = [
    (
        "I lose my temper over the smallest things.",
        """Frequent outbursts over minor triggers often mean there’s deeper stress or unmet needs building up underneath. CBT encourages you to pause and track your anger triggers. What’s the real emotion underneath—hurt? fear? exhaustion? Try writing down what happened, how you felt, and what you needed. Anger isn’t bad—it’s a signal. Once you understand what it’s trying to say, you can respond, not just react."""
    ),
    (
        "I get angry, then I feel guilty afterward.",
        """It’s common to feel shame after getting angry, especially if you regret your words or actions. But anger itself isn’t wrong—it’s how we express it that matters. CBT helps by breaking the guilt-anger cycle: reflect on what led to the reaction, practice self-compassion, and plan for next time. You can hold yourself accountable while also being kind to yourself. You're learning—not failing."""
    ),
    (
        "I feel like I’m always on edge.",
        """That “always ready to snap” feeling is often linked to hyperarousal—a state where your nervous system stays in fight-or-flight mode. CBT techniques like diaphragmatic breathing or grounding exercises help your body relearn calm. Try slowly inhaling through your nose, letting your belly rise, then exhaling longer than you inhale. The calmer your body, the more control you have over your reactions."""
    ),
    (
        "I hold grudges for a long time.",
        """Resentment can feel powerful at first—but over time, it weighs you down. CBT suggests exploring what belief the resentment is protecting. Maybe it’s “If I forgive, it means what they did was okay.” Forgiveness doesn’t mean approval—it means choosing to stop reliving the pain. Start by writing what the anger is costing you. Then ask what peace might look like—not for them, but for you."""
    ),
    (
        "People keep crossing my boundaries.",
        """Unexpressed anger often comes from unclear or ignored boundaries. CBT helps you identify where you need to say “no” or speak up more directly. Try this formula: “When you [action], I feel [emotion], and I need [boundary].” Setting limits is not unkind—it’s self-respect. You’re allowed to protect your energy without guilt."""
    ),
    (
        "I explode after bottling things up.",
        """Suppressing anger doesn’t make it go away—it just builds up until it overflows. CBT encourages assertive communication over suppression or aggression. Practice expressing how you feel while staying calm and clear. A helpful sentence starter is: “I feel frustrated when…” You don’t have to scream to be heard—you just need to speak from honesty, not buildup."""
    ),
    (
        "I get mad but don’t know why.",
        """Sometimes anger feels vague or unexplainable. That’s often because it’s masking other emotions—sadness, anxiety, shame. CBT teaches you to explore your feelings with curiosity, not judgment. Ask: “If this anger had a voice, what would it say?” or “What’s really bothering me beneath this reaction?” Giving words to those hidden layers reduces intensity and builds self-awareness."""
    ),
    (
        "I feel like I always have to be in control.",
        """Control can be a way to avoid fear or vulnerability. When things go wrong, you might lash out—not because you're mean, but because you're scared. CBT gently unpacks the belief that “If I don’t control everything, something bad will happen.” Learning to tolerate uncertainty and trust others can reduce this pressure and the anger that comes with it. You don’t have to hold the world up alone."""
    ),
    (
        "My anger pushes people away.",
        """You may be expressing pain in ways others can’t understand. CBT helps by shifting your focus from venting to connecting. Instead of yelling or withdrawing, practice naming the feeling underneath: “I feel hurt because I expected support and didn’t get it.” Vulnerability can be scary—but it leads to closeness, not conflict. You deserve to be heard and understood."""
    ),
    (
        "I resent people for not noticing how much I’m struggling.",
        """Unspoken needs often turn into quiet resentment. CBT helps by encouraging direct needs expression. People may not see your pain unless you show it—try saying, “I’ve been having a really hard time and could use some support.” Resentment grows in silence; relief begins with voice. You’re not a burden for needing care—you’re human."""
    )
]

# Insert entries into the table
cursor.executemany('INSERT INTO cbt_entries (title, content) VALUES (?, ?)', cbt_data)

# Commit and close connection
conn.commit()
conn.close()

print("Anger-related CBT entries inserted successfully into 'cbt_data.db'.")
