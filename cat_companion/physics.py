class PhysicsSystem:
    def __init__(self, gravity=0.8, friction=0.9, elastic_bounce=0.3):
        self.gravity = gravity          # Vertical pull when falling
        self.friction = friction        # Ground slide damping
        self.elastic_bounce = elastic_bounce # Elastic rebound factor

    def update_position(self, current_pos, velocity, boundary_w, boundary_h, is_grounded):
        """Calculates future position and velocity using gravity, ground friction, and boundary collisions."""
        x, y = current_pos
        vx, vy = velocity

        # Apply gravity if not on ground
        if not is_grounded:
            vy += self.gravity
        else:
            # Apply friction on surface slide
            vx *= self.friction
            if abs(vx) < 0.1:
                vx = 0

        # Predict future steps
        next_x = x + vx
        next_y = y + vy

        # Ground/Floor Boundary check
        if next_y >= boundary_h:
            next_y = boundary_h
            # Calculate bounce vs landing
            if abs(vy) > 2.0:
                vy = -vy * self.elastic_bounce # Rebound bounce
            else:
                vy = 0
                is_grounded = True
        else:
            # Verify if floating above floor boundary
            if next_y < boundary_h - 1:
                is_grounded = False

        # Ceiling Boundary check
        if next_y <= 0:
            next_y = 0
            vy = -vy * self.elastic_bounce

        # Left Boundary check
        if next_x <= 0:
            next_x = 0
            vx = -vx * self.elastic_bounce

        # Right Boundary check
        if next_x >= boundary_w:
            next_x = boundary_w
            vx = -vx * self.elastic_bounce

        return (next_x, next_y), (vx, vy), is_grounded
